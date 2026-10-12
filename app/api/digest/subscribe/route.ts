import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceClient } from "@/lib/supabase/service"
import { appUrl, confirmHtml, DIGEST_FROM, getResend } from "@/lib/digest"

const bodySchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) })

// Don't send another confirmation to the same address within this window,
// so the form can't be used to flood someone's inbox.
const RESEND_COOLDOWN_MS = 10 * 60 * 1000

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  }
  const { email } = parsed.data

  const resend = getResend()
  if (!resend) {
    return NextResponse.json({ error: "Email isn't set up yet. Please try again later." }, { status: 503 })
  }

  const supabase = createServiceClient()
  const { data: existing } = await supabase
    .from("digest_subscribers")
    .select("token, confirmed_at, created_at")
    .eq("email", email)
    .maybeSingle()

  // Same response whether or not the address is already subscribed, so the
  // form doesn't reveal who is on the list.
  const ok = NextResponse.json({ message: "Check your inbox to confirm your subscription." })

  if (existing?.confirmed_at) return ok
  if (existing && Date.now() - new Date(existing.created_at).getTime() < RESEND_COOLDOWN_MS) return ok

  let token = existing?.token as string | undefined
  if (existing) {
    await supabase.from("digest_subscribers").update({ created_at: new Date().toISOString() }).eq("email", email)
  } else {
    const { data, error } = await supabase.from("digest_subscribers").insert({ email }).select("token").single()
    if (error || !data) {
      console.error("Digest subscribe failed:", error)
      return NextResponse.json({ error: "Couldn't subscribe right now. Please try again." }, { status: 500 })
    }
    token = data.token
  }

  const { error } = await resend.emails.send({
    from: DIGEST_FROM,
    to: email,
    subject: "Confirm your ANDA weekly digest",
    html: confirmHtml(`${appUrl()}/api/digest/confirm?token=${token}`),
  })
  if (error) {
    console.error("Digest confirmation email failed:", error)
    return NextResponse.json({ error: "Couldn't send the confirmation email. Please try again." }, { status: 502 })
  }
  return ok
}
