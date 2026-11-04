import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { NEWSLETTER_CONSENT } from "@/lib/newsletter"

// Turn the newsletter on or off for the signed-in user (Account > Privacy and your data).
// The account's email is already confirmed, so subscribing takes effect straight away.
export async function PUT(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email || !user.email_confirmed_at) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (typeof body?.on !== "boolean") return NextResponse.json({ error: "Choose on or off." }, { status: 400 })

  const now = new Date().toISOString()
  const email = user.email.toLowerCase()
  const service = createServiceClient()
  const { error } = body.on
    ? await service.from("newsletter_subscribers").upsert(
        {
          email,
          user_id: user.id,
          first_name: (user.user_metadata?.first_name as string | undefined)?.slice(0, 100) ?? null,
          consent_text: NEWSLETTER_CONSENT,
          consent_source: "account",
          consented_at: now,
          unsubscribed_at: null,
        },
        { onConflict: "email" },
      )
    : await service.from("newsletter_subscribers").update({ unsubscribed_at: now }).eq("email", email)
  if (error) {
    console.error("Newsletter setting failed:", error)
    return NextResponse.json({ error: "That didn't save. Try again." }, { status: 500 })
  }
  return NextResponse.json({ on: body.on })
}
