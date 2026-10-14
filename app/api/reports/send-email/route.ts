import { createClient } from "@/lib/supabase/server"
import { generateEmailHTML } from "@/lib/reports-service"
import { upgradeRequiredResponse } from "@/lib/api-error"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import type { Report } from "@/lib/types/iep"
import { NextResponse } from "next/server"
import { Resend } from "resend"
import { getBranding, type Branding } from "@/lib/branding"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
    }

    if (!(await getEntitlement(supabase, user.id)).can("email_reports")) {
      return upgradeRequiredResponse("Emailing reports is part of the Pro plan.", FEATURE_MIN_TIER.email_reports)
    }

    const { report_id, recipient_email } = await request.json()

    if (!report_id || !recipient_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get report
    const { data: report } = await supabase.from("reports").select("*").eq("id", report_id).single()

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Send email (integrate with email service)
    const branding = await getBranding(supabase, user.id)
    const emailSent = await sendReportEmail(recipient_email, report, user.email || "", branding)

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    // Update report status
    await supabase
      .from("reports")
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq("id", report_id)

    return NextResponse.json({ message: "Report sent successfully" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Something didn't save. Your information is still here. Try again." }, { status: 500 })
  }
}

async function sendReportEmail(
  recipientEmail: string,
  report: Report,
  senderEmail: string,
  branding: Branding | null,
): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      console.error("Email send error: RESEND_API_KEY is not configured")
      return false
    }

    const resend = new Resend(apiKey)

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ANDA <noreply@anda.becomechange.institute>",
      to: recipientEmail,
      replyTo: senderEmail || undefined,
      subject: "ANDA NeuroCare | IEP Progress Report",
      html: generateEmailHTML(report, branding),
    })

    if (error) {
      console.error("Email send error:", error)
      return false
    }

    return true
  } catch (err) {
    console.error("Email send error:", err)
    return false
  }
}
