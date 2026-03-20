import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { APIError, errorHandler } from "@/lib/error-handler"
import { validateUUID } from "@/lib/validation"

interface DomainScore {
  domain: string
  total_score: number
  max_score: number
  percentage: number
  risk_level: "low" | "moderate" | "high"
}

function calculateRiskLevel(percentage: number): "low" | "moderate" | "high" {
  if (percentage < 30) return "low"
  if (percentage < 60) return "moderate"
  return "high"
}

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

    const { assessment_id } = body

    if (!validateUUID(assessment_id)) {
      throw new APIError(400, "INVALID_ASSESSMENT_ID", "Valid assessment_id required")
    }

    // Get assessment
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
      throw new APIError(400, "ALREADY_COMPLETED", "Assessment already completed")
    }

    // Get all answers for this assessment
    const { data: answers, error: answersError } = await supabase
      .from("assessment_answers")
      .select("domain, score_value")
      .eq("assessment_id", assessment_id)

    if (answersError) {
      throw new APIError(400, "DATABASE_ERROR", answersError.message)
    }

    // Calculate domain scores
    const domainScores: Record<string, { total: number; count: number }> = {}
    const domains = ["ADHD", "Autism", "Dyslexia", "Dyscalculia", "Anxiety", "Depression"]

    domains.forEach((domain) => {
      domainScores[domain] = { total: 0, count: 0 }
    })

    answers?.forEach((answer) => {
      if (answer.domain && answer.score_value !== null) {
        domainScores[answer.domain].total += answer.score_value
        domainScores[answer.domain].count += 1
      }
    })

    // Calculate percentages and risk levels
    const results: DomainScore[] = []
    let maxScore = 0
    let primaryDomain = ""

    domains.forEach((domain) => {
      const { total, count } = domainScores[domain]
      const avgScore = count > 0 ? total / count : 0
      const percentage = Math.min(100, Math.round((avgScore / 4) * 100)) // Assuming 4-point scale

      results.push({
        domain,
        total_score: total,
        max_score: count * 4,
        percentage,
        risk_level: calculateRiskLevel(percentage),
      })

      if (percentage > maxScore) {
        maxScore = percentage
        primaryDomain = domain
      }
    })

    // Sort by risk level
    const secondaryDomains = results
      .filter((r) => r.domain !== primaryDomain && r.percentage >= 30)
      .map((r) => r.domain)

    // Generate insights
    const summaryInsights = generateInsights(results, primaryDomain)

    // Update assessment with results
    const updateData: Record<string, any> = {
      completed: true,
      completed_at: new Date().toISOString(),
      progress_percentage: 100,
      primary_domain: primaryDomain,
      secondary_domains: secondaryDomains,
      summary_insights: summaryInsights,
    }

    // Add individual domain scores
    domains.forEach((domain) => {
      const score = results.find((r) => r.domain === domain)
      const fieldName = `${domain.toLowerCase()}_score`
      updateData[fieldName] = score?.percentage || 0
    })

    const { data: completedAssessment, error: updateError } = await supabase
      .from("assessments")
      .update(updateData)
      .eq("id", assessment_id)
      .select()
      .single()

    if (updateError) {
      throw new APIError(400, "DATABASE_ERROR", updateError.message)
    }

    return NextResponse.json(
      {
        assessment_id,
        completed: true,
        primary_domain: primaryDomain,
        secondary_domains: secondaryDomains,
        domain_scores: results,
        summary_insights: summaryInsights,
      },
      { status: 200 }
    )
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}

function generateInsights(results: DomainScore[], primaryDomain: string): string {
  const highRiskDomains = results
    .filter((r) => r.risk_level === "high")
    .map((r) => r.domain)

  let insights = `Your assessment indicates primary characteristics associated with ${primaryDomain}.`

  if (highRiskDomains.length > 1) {
    insights += ` You may also experience traits related to ${highRiskDomains.slice(1).join(", ")}.`
  }

  insights += ` These results are screening indicators, not diagnostic. We recommend discussing these findings with a qualified healthcare professional for proper assessment and support planning.`

  return insights
}
