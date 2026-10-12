import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { isFederationEnabled } from "@/lib/federation/config"
import { bearerToken, verifySiblingRequestToken } from "@/lib/federation/jwt"
import { validateCheckInSummary } from "@/lib/federation/contract"

// POST /api/federation/check-in-summary -- Neu Rafiki sends a structured
// summary of a check-in, signed with scope "check_in_summary". Neu Rafiki
// only sends it once the user has consented on its side. Raw assessment
// responses are never accepted here: only the validated summary shape.
// Stored as data kind 'check_in' and shown on the learner's timeline.
export async function POST(request: Request) {
  if (!isFederationEnabled()) return NextResponse.json({ error: "Federation is not enabled" }, { status: 503 })

  const token = bearerToken(request)
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 })

  let claims
  try {
    claims = await verifySiblingRequestToken(token, "check_in_summary")
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  const parsed = validateCheckInSummary(await request.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const summary = parsed.value

  const service = createServiceClient()
  const { data: link } = await service
    .from("linked_accounts")
    .select("id")
    .eq("local_user_id", claims.target_remote_user_id)
    .eq("remote_app", "neurafiki")
    .eq("remote_user_id", claims.requesting_user_id)
    .eq("status", "active")
    .maybeSingle()
  if (!link) return NextResponse.json({ error: "Not linked" }, { status: 404 })

  // The learner must belong to the linked ANDA user.
  const { data: learner } = await service
    .from("learner_profiles")
    .select("id")
    .eq("id", summary.learner_ref)
    .eq("user_id", claims.target_remote_user_id)
    .maybeSingle()
  if (!learner) return NextResponse.json({ error: "Unknown learner" }, { status: 404 })

  const { data, error } = await service
    .from("learner_records")
    .insert({
      learner_id: learner.id,
      created_by: claims.target_remote_user_id,
      kind: "check_in",
      record_type: "neurafiki_check_in",
      title: summary.goal_title ? `Check-in: ${summary.goal_title}` : "Check-in",
      record_date: summary.date,
      fields: { summary: summary.summary, goal_title: summary.goal_title, answers: summary.answers },
    })
    .select("id")
    .single()
  if (error) {
    console.error("check-in-summary insert failed")
    return NextResponse.json({ error: "Could not store the summary" }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
