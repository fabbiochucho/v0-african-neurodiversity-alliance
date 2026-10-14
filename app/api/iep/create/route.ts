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
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
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
    const allGoals: Array<{
      domain?: string
      goal_description?: string
      text?: string
      target_metric?: string
      baseline?: string
      measurement?: string
      target_date?: string
    }> = [
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
          baseline: goal.baseline || null,
          target: goal.target_metric || null,
          measurement: goal.measurement || null,
          target_completion_date: /^\d{4}-\d{2}-\d{2}$/.test(goal.target_date || "") ? goal.target_date : null,
        }))
        .filter((goal) => goal.goal_text)

      if (goalsWithIepId.length > 0) {
        await supabase.from("iep_goals").insert(goalsWithIepId)
      }
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Something didn't save. Your information is still here. Try again." }, { status: 500 })
  }
}
