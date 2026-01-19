import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { learnerId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get learner profile
    const { data: learner } = await supabase.from("learner_profiles").select("*").eq("id", params.learnerId).single()

    if (!learner) {
      return NextResponse.json({ error: "Learner not found" }, { status: 404 })
    }

    // Get IEPs
    const { data: ieps } = await supabase
      .from("ieps")
      .select("id, status, created_at")
      .eq("learner_id", params.learnerId)

    // Get all goals with progress
    const { data: goals } = await supabase
      .from("iep_goals")
      .select(
        `
      id,
      goal_text,
      domain,
      status,
      progress_logs(rating, logged_date)
    `,
      )
      .in("iep_id", ieps?.map((i) => i.id) || [])

    // Calculate overall progress
    let totalRatings = 0
    let sumRatings = 0
    const domainProgress: Record<string, any> = {}

    goals?.forEach((goal) => {
      if (!domainProgress[goal.domain]) {
        domainProgress[goal.domain] = { goals: 0, totalRating: 0, logs: 0 }
      }

      domainProgress[goal.domain].goals++

      const ratings = (goal.progress_logs || []).map((log: any) => log.rating)
      if (ratings.length > 0) {
        const avg = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        domainProgress[goal.domain].totalRating += avg
        domainProgress[goal.domain].logs++
        totalRatings += avg
        sumRatings++
      }
    })

    const domainSummary = Object.entries(domainProgress).map(([domain, data]: [string, any]) => ({
      domain,
      averageProgress: data.logs > 0 ? Number.parseFloat((data.totalRating / data.logs).toFixed(2)) : 0,
      totalGoals: data.goals,
    }))

    return NextResponse.json({
      learner,
      iepCount: ieps?.length || 0,
      goalCount: goals?.length || 0,
      overallProgress: sumRatings > 0 ? Number.parseFloat((totalRatings / sumRatings).toFixed(2)) : 0,
      domainProgress: domainSummary,
      recentLogs: goals
        ?.flatMap((g: any) =>
          g.progress_logs.map((log: any) => ({
            ...log,
            goalText: g.goal_text,
            domain: g.domain,
          })),
        )
        .sort((a: any, b: any) => new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime())
        .slice(0, 10),
    })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
