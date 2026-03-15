import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { validateProgressLog, validateUUID } from "@/lib/validation"
import { APIError, errorHandler } from "@/lib/error-handler"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new APIError(401, "UNAUTHORIZED", "User must be authenticated")
    }

    let body
    try {
      body = await request.json()
    } catch {
      throw new APIError(400, "INVALID_JSON", "Request body must be valid JSON")
    }

    const { goal_id, rating, notes } = body

    // Validate UUID format
    if (!goal_id || !validateUUID(goal_id)) {
      throw new APIError(400, "INVALID_GOAL_ID", "Valid goal_id is required")
    }

    // Validate progress data
    const validation = validateProgressLog({ goal_id, rating, notes })
    if (!validation.success) {
      throw new APIError(400, "VALIDATION_ERROR", "Invalid progress data", validation.errors)
    }

    // Verify goal exists and user has access
    const { data: goal, error: goalError } = await supabase
      .from("iep_goals")
      .select("iep_id")
      .eq("id", goal_id)
      .single()

    if (goalError || !goal) {
      throw new APIError(404, "GOAL_NOT_FOUND", "Goal not found")
    }

    // Verify user has access to this goal's IEP
    const { data: iep, error: iepError } = await supabase
      .from("ieps")
      .select("id")
      .eq("id", goal.iep_id)
      .or(`created_by.eq.${user.id},learner_profiles.user_id.eq.${user.id}`)
      .single()

    if (iepError || !iep) {
      throw new APIError(403, "ACCESS_DENIED", "You don't have permission to log progress for this goal")
    }

    const { data: progressData, error: progressError } = await supabase
      .from("progress_logs")
      .insert({
        goal_id,
        logged_by: user.id,
        rating,
        notes: notes || null,
        logged_date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single()

    if (progressError) {
      throw new APIError(400, "DATABASE_ERROR", progressError.message)
    }

    return NextResponse.json(progressData, { status: 201 })
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
