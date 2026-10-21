import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

// Turn the weekly check-in reminder on or off for the signed-in user
// (Account > Privacy and your data). The opt-out link in each email uses
// /api/email/reminders-off instead, which needs no sign-in.
export async function PUT(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (typeof body?.on !== "boolean") return NextResponse.json({ error: "Choose on or off." }, { status: 400 })

  // email_lifecycle is written only by the service role (scripts/051).
  const { error } = await createServiceClient()
    .from("email_lifecycle")
    .upsert({ user_id: user.id, reminders_off_at: body.on ? null : new Date().toISOString() }, { onConflict: "user_id" })
  if (error) {
    console.error("Reminder setting failed:", error)
    return NextResponse.json({ error: "That didn't save. Try again." }, { status: 500 })
  }
  return NextResponse.json({ on: body.on })
}
