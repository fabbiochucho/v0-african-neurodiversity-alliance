import { createClient } from "@/lib/supabase/server"
import { generateEmailHTML } from "@/lib/reports-service"
import type { Report } from "@/lib/types/iep"
import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
    const emailSent = await sendReportEmail(recipient_email, report, user.email || "")

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendReportEmail(recipientEmail: string, report: Report, senderEmail: string): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      console.error("Email send error: RESEND_API_KEY is not configured")
      return false
    }

    const resend = new Resend(apiKey)

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ANDA NeuroCare <reports@anda-neurocare.org>",
      to: recipientEmail,
      replyTo: senderEmail || undefined,
      subject: "ANDA NeuroCare | IEP Progress Report",
      html: generateEmailHTML(report),
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
