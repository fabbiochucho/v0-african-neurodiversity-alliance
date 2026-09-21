import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
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

    if (!learner_id) {
      return NextResponse.json({ error: "learner_id is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("ieps")
      .insert({
        learner_id,
        created_by: user.id,
        title,
        description,
        adaptive_goals: adaptive_goals || [],
        custom_goals: custom_goals || [],
        ai_summary,
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      return dbErrorResponse(error)
    }

    // Fan the jsonb adaptive_goals/custom_goals (GeneratedGoal shape:
    // { domain, goal_description, target_metric, timeline, notes? }) out into
    // normalized public.iep_goals rows.
    const allGoals: Array<{ domain?: string; goal_description?: string; text?: string }> = [
      ...(adaptive_goals || []),
      ...(custom_goals || []),
    ]

    if (allGoals.length > 0) {
      const goalsWithIepId = allGoals
        .map((goal) => ({
          iep_id: data.id,
          goal_text: goal.goal_description || goal.text || "",
          domain: goal.domain || null,
          status: "in_progress",
        }))
        .filter((goal) => goal.goal_text)

      if (goalsWithIepId.length > 0) {
        await supabase.from("iep_goals").insert(goalsWithIepId)
      }
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
