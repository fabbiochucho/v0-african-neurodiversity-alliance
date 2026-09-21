import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { generateReportContent } from "@/lib/reports-service"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { learner_id, report_type, report_period } = await request.json()

    if (!learner_id || !report_type || !report_period) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get learner and IEP data
    const { data: learner } = await supabase.from("learner_profiles").select("*").eq("id", learner_id).single()

    if (!learner) {
      return NextResponse.json({ error: "Learner not found" }, { status: 404 })
    }

    const { data: ieps } = await supabase.from("ieps").select("*, iep_goals(*)").eq("learner_id", learner_id)

    if (!ieps || ieps.length === 0) {
      return NextResponse.json({ error: "No IEPs found for this learner" }, { status: 404 })
    }

    // Get progress summaries
    const { data: summaries } = await supabase
      .from("progress_summaries")
      .select("*")
      .eq("learner_id", learner_id)
      .order("week_start_date", { ascending: false })
      .limit(report_type === "monthly" ? 4 : 13)

    // Generate report content
    const reportContent = generateReportContent(learner, ieps, summaries ?? [], report_type, report_period)

    // Save report to database
    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        learner_id,
        generated_by: user.id,
        report_type,
        report_period,
        content: reportContent,
      })
      .select()
      .single()

    if (error) {
      return dbErrorResponse(error)
    }

    return NextResponse.json(report, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
