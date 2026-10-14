import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { upgradeRequiredResponse } from "@/lib/api-error"
import { getEntitlement, nextTier } from "@/lib/entitlements"
import { fetchNeuRafikiAssessments } from "@/lib/federation/remote"
import { summariseAssessments } from "@/lib/federation/import-summary"
import { logAudit } from "@/lib/audit"

const CALM_ERROR = "Something didn't save. Your information is still here. Try again."

// POST /api/federation/import-summary { assessment_id?, learner_id? | new_name }
// "Continue to ANDA" handoff (brief §14): imports the consented assessment
// summary from NeuRafiki into a new or existing support profile, as data
// kind 'assessment'. Nothing is granted automatically: plans stay separate.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const fetched = await fetchNeuRafikiAssessments(supabase, user.id)
  if (!fetched.ok) return NextResponse.json({ error: fetched.error }, { status: fetched.status })

  const summaries = summariseAssessments(fetched.data, typeof body.assessment_id === "string" ? body.assessment_id : null)
  const summary = summaries[0]
  if (!summary) return NextResponse.json({ error: "We couldn't find that assessment in NeuRafiki." }, { status: 404 })

  let learnerId: string | null = typeof body.learner_id === "string" ? body.learner_id : null
  if (learnerId) {
    const { data: own } = await supabase.from("learner_profiles").select("id, diagnosis_domains").eq("id", learnerId).eq("user_id", user.id).maybeSingle()
    if (!own) return NextResponse.json({ error: "Choose one of your own support profiles." }, { status: 404 })
    const merged = Array.from(new Set([...((own.diagnosis_domains as string[]) ?? []), ...summary.areas]))
    await supabase.from("learner_profiles").update({ diagnosis_domains: merged }).eq("id", learnerId)
  } else {
    const name = typeof body.new_name === "string" && body.new_name.trim() ? body.new_name.trim().slice(0, 100) : summary.profileName
    const entitlement = await getEntitlement(supabase, user.id)
    const { count } = await supabase.from("learner_profiles").select("id", { count: "exact", head: true }).eq("user_id", user.id)
    if ((count ?? 0) >= entitlement.learnerLimit) {
      return upgradeRequiredResponse(`Your ANDA plan includes ${entitlement.learnerLimit} learner profile(s).`, nextTier(entitlement.tier))
    }
    const { data: created, error } = await supabase
      .from("learner_profiles")
      .insert({ user_id: user.id, name, diagnosis_domains: summary.areas })
      .select("id")
      .single()
    if (error) return NextResponse.json({ error: CALM_ERROR }, { status: 400 })
    learnerId = created.id
  }

  // 'assessment' rows are server-written only (scripts/042), after the
  // ownership checks above.
  try {
    const service = createServiceClient()
    const { error } = await service.from("learner_records").insert({
      learner_id: learnerId,
      created_by: user.id,
      kind: "assessment",
      record_type: "neurafiki_assessment",
      title: `NeuRafiki assessment (${summary.profileName})`,
      record_date: summary.completedAt?.slice(0, 10) ?? null,
      fields: { summary: summary.summary, areas: summary.areas, source_assessment_id: summary.sourceAssessmentId },
    })
    if (error) throw error
  } catch {
    return NextResponse.json({ error: CALM_ERROR }, { status: 500 })
  }

  await logAudit({ actorId: user.id, action: "change", resource: "NeuRafiki assessment summary imported", learnerId })
  return NextResponse.json({ ok: true, learner_id: learnerId }, { status: 201 })
}
