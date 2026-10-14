import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse, upgradeRequiredResponse } from "@/lib/api-error"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { hasActiveConsent } from "@/lib/companion"
import { aiProvider, extractJson, generate } from "@/lib/ai"
import { AI_DRAFT_JSON_INSTRUCTIONS, aiDraftPrompt, draftGoalsFromTemplates, parseAiDraft } from "@/lib/iep-plan"
import { loadPlan } from "@/lib/plan-data"
import { logAudit } from "@/lib/audit"

const AI_SYSTEM = `You help families and educators in Africa draft a practical support plan (IEP). You are not a clinician: never diagnose, never suggest medication or treatment, never invent facts about the person. Write short, concrete, strengths-based drafts. A person will review and approve everything; nothing you write is final.`

// POST /api/plan/[learnerId] { mode: "template" | "ai", action?: "start" }
//   start    -> create the plan (IEP row) if the learner has none (owner)
//   template -> add draft goals from the existing goal-suggestion data
//   ai       -> add AI-drafted goals and plan items (Pro+, consent, key)
// Drafts never join the official plan until someone with 'approve'
// approves them (scripts/045).
export async function POST(request: Request, { params }: { params: { learnerId: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const plan = await loadPlan(supabase, params.learnerId, user.id)
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!plan.can.manage) return NextResponse.json({ error: "You need manage-plan rights to draft this plan." }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  let iepId = plan.iep?.id
  if (!iepId) {
    if (!plan.isOwner) return NextResponse.json({ error: "The learner's owner needs to start the plan first." }, { status: 403 })
    const { data, error } = await supabase
      .from("ieps")
      .insert({ learner_id: plan.learner.id, created_by: user.id, title: `Support plan for ${plan.learner.name}`, status: "draft" })
      .select("id")
      .single()
    if (error) return dbErrorResponse(error)
    iepId = data.id
  }
  if (body.action === "start") return NextResponse.json({ iep_id: iepId })

  const existing = plan.goals.map((g) => g.goal_text)

  if (body.mode === "template") {
    const drafts = draftGoalsFromTemplates((plan.learner.diagnosis_domains as string[]) ?? [], existing)
    if (drafts.length === 0) {
      return NextResponse.json({ error: "No template goals match the support areas on file. Add goals yourself in Review." }, { status: 400 })
    }
    const { error } = await supabase
      .from("iep_goals")
      .insert(drafts.map((d) => ({ ...d, iep_id: iepId, status: "in_progress", source: "template", approval_status: "draft" })))
    if (error) return dbErrorResponse(error)
    await logAudit({ actorId: user.id, action: "change", resource: "template plan drafts added", learnerId: plan.learner.id })
    return NextResponse.json({ added: drafts.length })
  }

  if (body.mode === "ai") {
    if (!aiProvider()) return NextResponse.json({ error: "AI drafting isn't switched on." }, { status: 503 })
    if (!(await getEntitlement(supabase, user.id)).can("ai_companion")) {
      return upgradeRequiredResponse("AI-drafted plans are part of the Pro plan.", FEATURE_MIN_TIER.ai_companion)
    }
    const { data: events } = await supabase
      .from("ai_learner_consent_events")
      .select("action, consent_version, created_at")
      .eq("learner_id", plan.learner.id)
      .eq("user_id", user.id)
    if (!hasActiveConsent(events ?? [])) {
      return NextResponse.json({ error: "consent_required", consent_url: `/companion/consent/${plan.learner.id}` }, { status: 403 })
    }

    const result = await generate({
      system: AI_SYSTEM,
      messages: [
        {
          role: "user",
          content: `${aiDraftPrompt(plan.learner.name.trim().split(/\s+/)[0], plan.profile, existing)}\n\n${AI_DRAFT_JSON_INSTRUCTIONS}`,
        },
      ],
      maxTokens: 2048,
    })
    if (!result.ok) {
      if (result.reason === "refused") return NextResponse.json({ error: "AI couldn't draft this plan. Use templates instead." }, { status: 422 })
      return NextResponse.json({ error: "AI drafting is unavailable right now. Use templates instead." }, { status: 502 })
    }
    // Never trust the model's shape: parseAiDraft validates every field.
    const parsed = parseAiDraft(extractJson(result.text))
    if (!parsed) return NextResponse.json({ error: "AI drafting returned nothing usable. Use templates instead." }, { status: 502 })

    if (parsed.goals.length > 0) {
      const { error } = await supabase
        .from("iep_goals")
        .insert(parsed.goals.map((g) => ({ ...g, iep_id: iepId, status: "in_progress", source: "ai", approval_status: "draft" })))
      if (error) return dbErrorResponse(error)
    }
    if (parsed.items.length > 0) {
      const { error } = await supabase
        .from("iep_plan_items")
        .insert(parsed.items.map((i) => ({ ...i, iep_id: iepId, source: "ai", status: "draft", created_by: user.id })))
      if (error) return dbErrorResponse(error)
    }
    await logAudit({ actorId: user.id, action: "change", resource: "AI plan drafts added", learnerId: plan.learner.id })
    return NextResponse.json({ added: parsed.goals.length + parsed.items.length })
  }

  return NextResponse.json({ error: "Unknown mode" }, { status: 400 })
}
