import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminEmail } from "@/lib/admin"
import { getResend } from "@/lib/digest"
import { createServiceClient } from "@/lib/supabase/service"
import { NEWSLETTER_FROM, newsletterHtml, newsletterText, unsubscribeUrl } from "@/lib/newsletter"

// ponytail: sends inside one request (100 per Resend batch call). Fine for thousands of
// subscribers; move to a queue or cron if a send ever nears this limit.
export const maxDuration = 300

const bodySchema = z.object({
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(50000),
  mode: z.enum(["preview", "test", "all"]),
  confirm: z.string().optional(),
})

export async function POST(request: Request) {
  const admin = await getAdminEmail()
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Add a subject and some text." }, { status: 400 })
  const { subject, body, mode, confirm } = parsed.data
  if (mode === "all" && confirm !== "SEND") {
    return NextResponse.json({ error: "Type SEND to confirm sending to every subscriber." }, { status: 400 })
  }

  if (mode === "preview") return NextResponse.json({ html: newsletterHtml(subject, body, "#unsubscribe") })

  const resend = getResend()
  if (!resend) return NextResponse.json({ error: "Email isn't set up (RESEND_API_KEY)." }, { status: 503 })

  const service = createServiceClient()
  const message = (to: string, token: string) => {
    const unsubscribe = unsubscribeUrl(token)
    return {
      from: NEWSLETTER_FROM,
      to,
      subject: mode === "test" ? `[Test] ${subject}` : subject,
      html: newsletterHtml(subject, body, unsubscribe),
      text: newsletterText(subject, body, unsubscribe),
      headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    }
  }

  if (mode === "test") {
    // The unsubscribe link in a test is a dummy token, so clicking it changes nothing.
    const { error } = await resend.emails.send(message(admin, "00000000-0000-0000-0000-000000000000"))
    if (error) return NextResponse.json({ error: `Test failed: ${error.message}` }, { status: 502 })
    return NextResponse.json({ message: `Test sent to ${admin}.` })
  }

  // Active subscribers only, read in pages (the API returns at most 1,000 rows at a time).
  const recipients: { email: string; token: string }[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await service
      .from("newsletter_subscribers")
      .select("email, token")
      .is("unsubscribed_at", null)
      .order("created_at")
      .range(from, from + 999)
    if (error) return NextResponse.json({ error: "Couldn't load subscribers." }, { status: 500 })
    recipients.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  if (!recipients.length) return NextResponse.json({ error: "There are no subscribers yet." }, { status: 400 })

  let sent = 0
  let failed = 0
  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100)
    const { error } = await resend.batch.send(chunk.map((r) => message(r.email, r.token)))
    if (error) {
      console.error("Newsletter batch failed:", error)
      failed += chunk.length
    } else sent += chunk.length
  }

  await service.from("newsletter_issues").insert({ subject, body, sent_by: admin, recipients: sent, failed })
  return NextResponse.json({
    message: failed ? `Sent to ${sent}; ${failed} failed (see logs).` : `Sent to ${sent} subscriber${sent === 1 ? "" : "s"}.`,
  })
}
