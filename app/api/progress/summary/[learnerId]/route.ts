import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { NextResponse } from "next/server"
import { snapshotFromGoals } from "@/lib/journey"

export async function POST(request: Request, { params }: { params: { learnerId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all goals for learner
    const { data: ieps } = await supabase.from("ieps").select("id").eq("learner_id", params.learnerId)

    if (!ieps || ieps.length === 0) {
      return NextResponse.json({ error: "No IEPs found" }, { status: 404 })
    }

    const iepIds = ieps.map((iep) => iep.id)

    // Get all goals and their progress
    const { data: goals } = await supabase
      .from("iep_goals")
      .select(
        `
      id,
      goal_text,
      domain,
      progress_logs(rating, logged_date)
    `,
      )
      .in("iep_id", iepIds)

    const snapshot = snapshotFromGoals(goals ?? [])
    if (!snapshot) {
      return NextResponse.json({ error: "No check-ins in the last 30 days to snapshot yet." }, { status: 400 })
    }
    const { domainAverages, summaryText } = snapshot

    // Get week boundaries
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weekStartStr = weekStart.toISOString().split("T")[0]
    const weekEndStr = weekEnd.toISOString().split("T")[0]

    const { data: summary, error } = await supabase
      .from("progress_summaries")
      .insert({
        learner_id: params.learnerId,
        week_start_date: weekStartStr,
        week_end_date: weekEndStr,
        summary_text: summaryText,
        domain_progress: domainAverages,
      })
      .select()
      .single()

    if (error) {
      return dbErrorResponse(error)
    }

    return NextResponse.json(summary, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { learnerId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("progress_summaries")
      .select("*")
      .eq("learner_id", params.learnerId)
      .order("week_start_date", { ascending: false })
      .limit(12)

    if (error) {
      return dbErrorResponse(error)
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
