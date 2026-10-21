import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { isCronRequest } from "@/lib/cron-auth"
import { appUrl, DIGEST_FROM, getResend } from "@/lib/digest"
import { reminderEmail, welcomeEmail } from "@/lib/lifecycle-emails"

export const dynamic = "force-dynamic"
export const maxDuration = 300

const BATCH_SIZE = 100 // Resend batch API limit

type Due = { user_id: string; email: string; first_name: string | null }

// Daily (vercel.json): welcome emails for new confirmed accounts, and a weekly
// check-in reminder for people with a learner but no check-in in 7 days.
export async function GET(request: Request) {
  if (!isCronRequest(request)) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
  }
  const resend = getResend()
  if (!resend) return NextResponse.json({ skipped: "RESEND_API_KEY not set" })

  const supabase = createServiceClient()
  const [welcome, reminder] = await Promise.all([
    supabase.rpc("lifecycle_welcome_due"),
    supabase.rpc("lifecycle_reminder_due"),
  ])
  if (welcome.error || reminder.error) {
    console.error("Lifecycle query failed:", welcome.error ?? reminder.error)
    return NextResponse.json({ error: "Failed to load recipients" }, { status: 500 })
  }
  const welcomeDue = (welcome.data ?? []) as Due[]
  const reminderDue = (reminder.data ?? []) as Due[]

  // Every recipient needs a row (and so an opt-out token) before we email them.
  const ids = [...new Set([...welcomeDue, ...reminderDue].map((d) => d.user_id))]
  if (ids.length) {
    const { error } = await supabase
      .from("email_lifecycle")
      .upsert(ids.map((user_id) => ({ user_id })), { onConflict: "user_id", ignoreDuplicates: true })
    if (error) {
      console.error("Lifecycle upsert failed:", error)
      return NextResponse.json({ error: "Failed to prepare recipients" }, { status: 500 })
    }
  }
  const { data: rows } = ids.length
    ? await supabase.from("email_lifecycle").select("user_id, token").in("user_id", ids)
    : { data: [] as { user_id: string; token: string }[] }
  const tokens = new Map((rows ?? []).map((r) => [r.user_id, r.token]))

  const base = appUrl()
  const now = new Date().toISOString()

  async function send(due: Due[], build: (d: Due) => { subject: string; html: string; headers?: Record<string, string> }, mark: string) {
    let sent = 0
    for (let i = 0; i < due.length; i += BATCH_SIZE) {
      const batch = due.slice(i, i + BATCH_SIZE)
      const { error } = await resend!.batch.send(batch.map((d) => ({ from: DIGEST_FROM, to: d.email, ...build(d) })))
      if (error) {
        console.error(`Lifecycle ${mark} batch ${i / BATCH_SIZE} failed:`, error)
        continue
      }
      await supabase.from("email_lifecycle").update({ [mark]: now }).in("user_id", batch.map((d) => d.user_id))
      sent += batch.length
    }
    return sent
  }

  const welcomed = await send(welcomeDue, (d) => welcomeEmail(d.first_name), "welcome_sent_at")
  const reminded = await send(
    reminderDue.filter((d) => tokens.has(d.user_id)),
    (d) => {
      const optOutUrl = `${base}/api/email/reminders-off?token=${tokens.get(d.user_id)}`
      return {
        ...reminderEmail(d.first_name, optOutUrl),
        headers: { "List-Unsubscribe": `<${optOutUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      }
    },
    "last_reminder_at",
  )

  return NextResponse.json({ welcomed, reminded })
}
