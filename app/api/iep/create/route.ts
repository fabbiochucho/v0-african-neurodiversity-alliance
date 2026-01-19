import { createClient } from "@/lib/supabase/server"
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

    const { learner_id, title, description, adaptive_goals, custom_goals, ai_summary } = await request.json()

    const { data, error } = await supabase
      .from("ieps")
      .insert({
        learner_id,
        created_by: user.id,
        title,
        description,
        adaptive_goals,
        custom_goals,
        ai_summary,
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create IEP goals
    const allGoals = [...(adaptive_goals || []), ...(custom_goals || [])]

    if (allGoals.length > 0) {
      const goalsWithIepId = allGoals.map((goal: any) => ({
        iep_id: data.id,
        goal_text: goal.text || goal,
        domain: goal.domain,
        status: "in_progress",
      }))

      await supabase.from("iep_goals").insert(goalsWithIepId)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
