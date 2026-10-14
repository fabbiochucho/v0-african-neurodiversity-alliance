import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { CONSENT_VERSION } from "@/lib/companion"

// POST /api/companion/consent { learner_id, action: "granted" | "revoked" }
// Appends a consent event (scripts/033). RLS limits this to the learner's
// owner; there is no update/delete, so the history is an audit trail.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  if (typeof body.learner_id !== "string" || !["granted", "revoked"].includes(body.action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { error } = await supabase.from("ai_learner_consent_events").insert({
    learner_id: body.learner_id,
    user_id: user.id,
    action: body.action,
    consent_version: CONSENT_VERSION,
  })
  if (error) return dbErrorResponse(error)

  return NextResponse.json({ ok: true, action: body.action })
}
