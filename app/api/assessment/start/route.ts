import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { APIError, errorHandler } from "@/lib/error-handler"
import { validateUUID } from "@/lib/validation"

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

    const { learner_id, age_group, language = "en", assessment_type = "screening" } = body

    // Validate age group
    if (!age_group || !["child", "teen", "adult"].includes(age_group)) {
      throw new APIError(400, "INVALID_AGE_GROUP", "Valid age_group required: child, teen, or adult")
    }

    // Get learner if provided to ensure access
    if (learner_id) {
      if (!validateUUID(learner_id)) {
        throw new APIError(400, "INVALID_LEARNER_ID", "Valid learner_id required")
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
    }

    // Create assessment record
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .insert({
        user_id: user.id,
        learner_id: learner_id || null,
        age_group,
        language,
        assessment_type,
        progress_percentage: 0,
        completed: false,
      })
      .select()
      .single()

    if (assessmentError) {
      throw new APIError(400, "DATABASE_ERROR", assessmentError.message)
    }

    // Get assessment questions for this age group
    const { data: questions, error: questionsError } = await supabase
      .from("assessment_questions")
      .select(
        `
        id,
        domain,
        question_text,
        question_order,
        language,
        assessment_options (
          id,
          option_text,
          score_value,
          option_order
        )
      `
      )
      .eq("age_group", age_group)
      .eq("language", language)
      .order("domain", { ascending: true })
      .order("question_order", { ascending: true })

    if (questionsError) {
      throw new APIError(400, "DATABASE_ERROR", questionsError.message)
    }

    return NextResponse.json(
      {
        assessment_id: assessment.id,
        age_group,
        language,
        assessment_type,
        total_questions: questions?.length || 0,
        questions: questions || [],
      },
      { status: 201 }
    )
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
