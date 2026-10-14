import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { GOAL_DOMAINS } from "@/lib/constants/iep"
import { PLAN_SECTIONS } from "@/lib/iep-plan"
import { logAudit } from "@/lib/audit"

const SECTIONS = PLAN_SECTIONS.map((s) => s.key) as string[]
const text = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null)

// POST /api/plan/items
//   { kind: "item", iep_id, learner_id, section, content }
//   { kind: "goal", iep_id, learner_id, goal_text, domain, baseline, target, ... }
// Adds person-written content as a draft (manage_plan) or a suggestion
// (suggest_goal). RLS (scripts/045) enforces both.
//
// PATCH /api/plan/items { id, content, learner_id } -- edit a draft item's text.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  if (typeof body.iep_id !== "string" || typeof body.learner_id !== "string") {
    return NextResponse.json({ error: "iep_id and learner_id are required" }, { status: 400 })
  }
  const { data: canManage } = await supabase.rpc("has_permission", { p_learner_id: body.learner_id, p_perm: "manage_plan" })
  const status = canManage === true ? "draft" : "suggested"

  if (body.kind === "item") {
    const content = text(body.content, 2000)
    if (!SECTIONS.includes(body.section) || !content) return NextResponse.json({ error: "Choose a section and write something." }, { status: 400 })
    const { error } = await supabase
      .from("iep_plan_items")
      .insert({ iep_id: body.iep_id, section: body.section, content, source: "person", status, created_by: user.id })
    if (error) return dbErrorResponse(error)
  } else if (body.kind === "goal") {
    const goalText = text(body.goal_text, 300)
    if (!goalText) return NextResponse.json({ error: "Write the goal." }, { status: 400 })
    const review = typeof body.review_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.review_date) ? body.review_date : null
    const { error } = await supabase.from("iep_goals").insert({
      iep_id: body.iep_id,
      goal_text: goalText,
      domain: (GOAL_DOMAINS as readonly string[]).includes(body.domain) ? body.domain : null,
      baseline: text(body.baseline, 1000),
      target: text(body.target, 1000),
      measurement: text(body.measurement, 300),
      frequency: text(body.frequency, 100),
      responsible_person: text(body.responsible_person, 200),
      support_strategy: text(body.support_strategy, 1000),
      review_date: review,
      status: "in_progress",
      source: "person",
      approval_status: status,
    })
    if (error) return dbErrorResponse(error)
  } else {
    return NextResponse.json({ error: "Unknown kind" }, { status: 400 })
  }

  await logAudit({ actorId: user.id, action: "change", resource: `plan ${body.kind} ${status === "draft" ? "drafted" : "suggested"}`, learnerId: body.learner_id })
  return NextResponse.json({ ok: true, status }, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const content = text(body.content, 2000)
  if (typeof body.id !== "string" || !content) return NextResponse.json({ error: "Write something." }, { status: 400 })

  // The trigger only allows text edits on drafts and marks them edited.
  const { data, error } = await supabase.from("iep_plan_items").update({ content }).eq("id", body.id).select("id")
  if (error) return dbErrorResponse(error)
  if (!data?.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (typeof body.learner_id === "string") {
    await logAudit({ actorId: user.id, action: "change", resource: "plan draft edited", learnerId: body.learner_id })
  }
  return NextResponse.json({ ok: true })
}
