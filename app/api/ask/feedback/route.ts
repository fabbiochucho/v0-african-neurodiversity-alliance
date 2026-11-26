import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/ask/feedback  { id, helpful }  "Did this help?" on a reviewed answer. Counts only.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const id = typeof body?.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id) ? body.id : null
  if (!id || typeof body?.helpful !== "boolean") return NextResponse.json({ error: "Invalid feedback" }, { status: 400 })
  const supabase = await createClient()
  await supabase.rpc("rate_reviewed_answer", { answer_id: id, was_helpful: body.helpful })
  return NextResponse.json({ ok: true })
}
