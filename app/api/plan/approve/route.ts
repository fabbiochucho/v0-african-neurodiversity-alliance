import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { logAudit } from "@/lib/audit"

// POST /api/plan/approve { iep_id, learner_id, goal_ids, item_ids, reject? }
// Approves (or rejects) drafts and suggestions. Only someone with
// 'approve' can; the database function checks it, records approved_by /
// approved_at and saves a new plan version (scripts/045).
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const ids = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [])
  if (typeof body.iep_id !== "string") return NextResponse.json({ error: "iep_id is required" }, { status: 400 })

  const { data: version, error } = await supabase.rpc("approve_plan_items", {
    p_iep_id: body.iep_id,
    p_goal_ids: ids(body.goal_ids),
    p_item_ids: ids(body.item_ids),
    p_reject: body.reject === true,
  })
  if (error) return dbErrorResponse(error, 403)

  if (typeof body.learner_id === "string") {
    await logAudit({
      actorId: user.id,
      action: "change",
      resource: body.reject ? "plan drafts rejected" : `plan approved (version ${version})`,
      learnerId: body.learner_id,
    })
  }
  return NextResponse.json({ ok: true, version })
}
