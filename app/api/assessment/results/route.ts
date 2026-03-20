import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { APIError, errorHandler } from "@/lib/error-handler"
import { validateUUID } from "@/lib/validation"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new APIError(401, "UNAUTHORIZED", "User must be authenticated")
    }

    // Get assessment_id from query params
    const { searchParams } = new URL(request.url)
    const assessment_id = searchParams.get("assessment_id")

    if (!assessment_id || !validateUUID(assessment_id)) {
      throw new APIError(400, "INVALID_ASSESSMENT_ID", "Valid assessment_id required")
    }

    // Get assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select(
        `
        id,
        user_id,
        learner_id,
        age_group,
        language,
        assessment_type,
        completed,
        progress_percentage,
        adhd_score,
        autism_score,
        dyslexia_score,
        dyscalculia_score,
        anxiety_score,
        depression_score,
        primary_domain,
        secondary_domains,
        summary_insights,
        created_at,
        completed_at
      `
      )
      .eq("id", assessment_id)
      .eq("user_id", user.id)
      .single()

    if (assessmentError || !assessment) {
      throw new APIError(404, "ASSESSMENT_NOT_FOUND", "Assessment not found or access denied")
    }

    if (!assessment.completed) {
      throw new APIError(400, "NOT_COMPLETED", "Assessment not yet completed")
    }

    // Get all answers with question details
    const { data: detailedAnswers, error: answersError } = await supabase
      .from("assessment_answers")
      .select(
        `
        id,
        question_id,
        domain,
        score_value,
        assessment_questions (
          id,
          question_text,
          domain
        )
      `
      )
      .eq("assessment_id", assessment_id)

    if (answersError) {
      throw new APIError(400, "DATABASE_ERROR", answersError.message)
    }

    // Group answers by domain
    const answersByDomain: Record<string, any[]> = {}
    detailedAnswers?.forEach((answer) => {
      if (!answersByDomain[answer.domain]) {
        answersByDomain[answer.domain] = []
      }
      answersByDomain[answer.domain].push(answer)
    })

    // Get recommendations based on assessment
    const recommendations = getRecommendations(assessment.primary_domain, assessment.secondary_domains)

    // Get relevant resources
    const { data: resources } = await supabase
      .from("resources")
      .select("id, title, description, category, url")
      .in("tags", [assessment.primary_domain, ...(assessment.secondary_domains || [])])
      .limit(10)

    return NextResponse.json(
      {
        assessment,
        answers_by_domain: answersByDomain,
        recommendations,
        resources: resources || [],
      },
      { status: 200 }
    )
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}

function getRecommendations(primaryDomain: string, secondaryDomains: string[] = []): string[] {
  const recommendations: Record<string, string[]> = {
    ADHD: [
      "Work with a neuropsychologist or psychiatrist for comprehensive evaluation",
      "Explore structured routines and organizational tools",
      "Consider support groups for ADHD experiences",
      "Discuss medication and non-medication treatment options with a healthcare provider",
    ],
    Autism: [
      "Connect with autism-affirming support services",
      "Explore sensory accommodation strategies",
      "Join autistic community networks and groups",
      "Work with specialists in autism assessment and support",
    ],
    Dyslexia: [
      "Seek evaluation by a dyslexia specialist",
      "Explore multisensory reading interventions",
      "Use assistive technology for reading and writing",
      "Connect with dyslexia support communities",
    ],
    Dyscalculia: [
      "Consult with specialists in math learning difficulties",
      "Explore multi-sensory math learning approaches",
      "Use visual and manipulative-based learning tools",
      "Join communities of learners with dyscalculia",
    ],
    Anxiety: [
      "Consider therapy with a trained mental health professional",
      "Learn evidence-based anxiety management techniques",
      "Explore support groups and peer communities",
      "Discuss treatment options including therapy and medication",
    ],
    Depression: [
      "Speak with a mental health professional immediately",
      "Explore evidence-based treatments like CBT or therapy",
      "Build a support network of trusted individuals",
      "Develop self-care and wellness routines",
    ],
  }

  return recommendations[primaryDomain] || []
}
