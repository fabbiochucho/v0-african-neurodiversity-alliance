import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CRISIS_RESPONSE } from "@/lib/companion"
import { queueExpertQuestion } from "@/lib/expert-queue"

// POST /api/ask  { question }  Send a question to an ANDA expert (signed in).
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const result = await queueExpertQuestion(user.id, body?.question)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json({ ok: true, ...(result.crisis ? { crisis: CRISIS_RESPONSE } : {}) })
}
