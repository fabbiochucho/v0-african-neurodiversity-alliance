import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { validateIEPData, validateUUID } from "@/lib/validation"
import { APIError, errorHandler, createSuccessResponse } from "@/lib/error-handler"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new APIError(401, "UNAUTHORIZED", "User must be authenticated")
    }

    let body;
    try {
      body = await request.json()
    } catch {
      throw new APIError(400, "INVALID_JSON", "Request body must be valid JSON")
    }

    const { learner_id, title, description, adaptive_goals, custom_goals, ai_summary } = body

    // Validate learner_id exists and belongs to user
    if (!learner_id || !validateUUID(learner_id)) {
      throw new APIError(400, "INVALID_LEARNER_ID", "Valid learner_id is required")
    }

    const { data: learner, error: learnerError } = await supabase
      .from("learner_profiles")
      .select("id")
      .eq("id", learner_id)
      .eq("user_id", user.id)
      .single()

    if (learnerError || !learner) {
      throw new APIError(403, "LEARNER_NOT_FOUND", "Learner not found or access denied")
    }

    // Validate IEP data
    const validation = validateIEPData({
      learner_id,
      title,
      description,
    })

    if (!validation.success) {
      throw new APIError(400, "VALIDATION_ERROR", "Invalid IEP data", validation.errors)
    }

    // Validate goals
    const allGoals = [...(adaptive_goals || []), ...(custom_goals || [])]
    if (allGoals.length === 0) {
      throw new APIError(400, "NO_GOALS", "At least one goal is required")
    }
    if (allGoals.length > 50) {
      throw new APIError(400, "TOO_MANY_GOALS", "Maximum 50 goals allowed")
    }

    const { data: iepData, error: iepError } = await supabase
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

    if (iepError) {
      throw new APIError(400, "DATABASE_ERROR", iepError.message)
    }

    // Create IEP goals
    const goalsWithIepId = allGoals.map((goal: any) => ({
      iep_id: iepData.id,
      goal_text: typeof goal === 'string' ? goal : (goal.text || goal.goal_text || ''),
      domain: goal.domain || 'general',
      status: "in_progress",
    }))

    const { error: goalsError } = await supabase.from("iep_goals").insert(goalsWithIepId)

    if (goalsError) {
      console.error("[v0] Goals creation error:", goalsError)
      // Continue - IEP was created successfully even if goals failed
    }

    return NextResponse.json(iepData, { status: 201 })
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
