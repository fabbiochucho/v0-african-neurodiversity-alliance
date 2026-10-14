import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse, upgradeRequiredResponse } from "@/lib/api-error"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { parseAnswers, screeningFlag } from "@/lib/screening"
import { DIAGNOSIS_DOMAINS } from "@/lib/constants/iep"

// POST /api/screening
//   { learner_id, kind: "quick", answers: { social: "often", ... } }
//   { learner_id, kind: "neurafiki", areas: ["ADHD", ...], source_note }
// RLS (scripts/035) also requires the caller to own the learner and the tier.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  if (typeof body.learner_id !== "string") return NextResponse.json({ error: "learner_id is required" }, { status: 400 })

  let row: { kind: string; answers: unknown; areas: string[]; source_note: string | null }

  if (body.kind === "quick") {
    const answers = parseAnswers(body.answers)
    if (!answers) return NextResponse.json({ error: "Answer every question." }, { status: 400 })
    row = { kind: "quick", answers, areas: screeningFlag(answers).areasToLookInto, source_note: null }
  } else if (body.kind === "neurafiki") {
    if (!(await getEntitlement(supabase, user.id)).can("screening_in_depth")) {
      return upgradeRequiredResponse("In-depth assessment results are part of the Premium plan.", FEATURE_MIN_TIER.screening_in_depth)
    }
    const areas = Array.isArray(body.areas)
      ? body.areas.filter((a: unknown): a is string => typeof a === "string" && (DIAGNOSIS_DOMAINS as readonly string[]).includes(a))
      : []
    row = {
      kind: "neurafiki",
      answers: null,
      areas,
      source_note: typeof body.source_note === "string" ? body.source_note.slice(0, 200) : null,
    }
  } else {
    return NextResponse.json({ error: "Unknown screening kind" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("screenings")
    .insert({ learner_id: body.learner_id, screened_by: user.id, ...row })
    .select()
    .single()
  if (error) return dbErrorResponse(error)

  return NextResponse.json(data, { status: 201 })
}
