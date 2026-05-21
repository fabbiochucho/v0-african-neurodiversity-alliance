import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { APIError, errorHandler } from "@/lib/error-handler"
import { validateUUID } from "@/lib/validation"
import { createRateLimiter, handleRateLimit } from "@/lib/middleware/rate-limit"

const rateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many assessment answers submitted. Please try again later.",
})

export async function POST(request: Request) {
  // Apply rate limiting
  const rateLimitResult = rateLimiter(request)
  const rateLimitError = handleRateLimit(rateLimitResult)
  if (rateLimitError) return rateLimitError

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

    const { assessment_id, question_id, option_id, answer_text } = body

    // Validate UUIDs
    if (!validateUUID(assessment_id) || !validateUUID(question_id)) {
      throw new APIError(400, "INVALID_IDS", "Valid assessment_id and question_id required")
    }

    if (!option_id && !answer_text) {
      throw new APIError(400, "INVALID_ANSWER", "Either option_id or answer_text must be provided")
    }

    // Verify assessment exists and belongs to user
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select("id, completed")
      .eq("id", assessment_id)
      .eq("user_id", user.id)
      .single()

    if (assessmentError || !assessment) {
      throw new APIError(404, "ASSESSMENT_NOT_FOUND", "Assessment not found")
    }

    if (assessment.completed) {
      throw new APIError(400, "ASSESSMENT_COMPLETED", "Assessment already completed")
    }

    // Verify question exists and belongs to this assessment
    const { data: question, error: questionError } = await supabase
      .from("assessment_questions")
      .select("id, domain")
      .eq("id", question_id)
      .single()

    if (questionError || !question) {
      throw new APIError(404, "QUESTION_NOT_FOUND", "Question not found")
    }

    // Get score value if option provided
    let scoreValue = null
    if (option_id) {
      if (!validateUUID(option_id)) {
        throw new APIError(400, "INVALID_OPTION_ID", "Valid option_id required")
      }

      const { data: option, error: optionError } = await supabase
        .from("assessment_options")
        .select("score_value")
        .eq("id", option_id)
        .eq("question_id", question_id)
        .single()

      if (optionError || !option) {
        throw new APIError(404, "OPTION_NOT_FOUND", "Option not found")
      }

      scoreValue = option.score_value
    }

    // Store answer
    const { data: answer, error: answerError } = await supabase
      .from("assessment_answers")
      .insert({
        assessment_id,
        question_id,
        option_id: option_id || null,
        answer_text: answer_text || null,
        score_value: scoreValue,
        domain: question.domain,
      })
      .select()
      .single()

    if (answerError) {
      throw new APIError(400, "DATABASE_ERROR", answerError.message)
    }

    return NextResponse.json(answer, { status: 201 })
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
