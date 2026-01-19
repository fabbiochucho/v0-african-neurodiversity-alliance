import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { goalId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("progress_logs")
      .select("*")
      .eq("goal_id", params.goalId)
      .order("logged_date", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Calculate progress metrics
    const ratings = data?.map((log) => log.rating) || []
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    const trend = ratings.length >= 2 ? ratings[0] - ratings[ratings.length - 1] : 0

    return NextResponse.json({
      logs: data,
      metrics: {
        totalLogs: ratings.length,
        averageRating: Number.parseFloat(averageRating.toFixed(2)),
        trend: trend > 0 ? "improving" : trend < 0 ? "declining" : "stable",
        latestRating: ratings[0] || null,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
