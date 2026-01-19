import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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

    // Calculate domain progress
    const domainProgress: Record<string, number[]> = {}

    goals?.forEach((goal) => {
      if (!domainProgress[goal.domain]) {
        domainProgress[goal.domain] = []
      }

      const ratings = (goal.progress_logs || []).map((log: any) => log.rating)
      if (ratings.length > 0) {
        const avg = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        domainProgress[goal.domain].push(avg)
      }
    })

    // Calculate average per domain
    const domainAverages: Record<string, number> = {}
    Object.entries(domainProgress).forEach(([domain, ratings]) => {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
      domainAverages[domain] = Number.parseFloat(avg.toFixed(2))
    })

    // Get week boundaries
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weekStartStr = weekStart.toISOString().split("T")[0]
    const weekEndStr = weekEnd.toISOString().split("T")[0]

    // Create summary
    const summaryText = `Weekly Summary: Made progress across ${Object.keys(domainProgress).length} domains. Average progress: ${(
      Object.values(domainAverages).reduce((a, b) => a + b, 0) / Object.keys(domainAverages).length
    ).toFixed(2)}/5`

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
      return NextResponse.json({ error: error.message }, { status: 400 })
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
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
