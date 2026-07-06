// IEP Service - Business Logic

import type { GeneratedGoal, IEPGoal, LearnerProfile, ProgressLog } from "./types/iep"
import { ADAPTIVE_GOALS } from "./constants/iep"

export class IEPService {
  /**
   * Generate adaptive IEP goals based on a learner's diagnosis domains.
   * Returns the plain jsonb-shaped goals that get stored in
   * ieps.adaptive_goals before the IEP row (and its normalized iep_goals
   * rows) are created.
   */
  static generateAdaptiveGoals(learner: Pick<LearnerProfile, "diagnosis_domains">): GeneratedGoal[] {
    const goals: GeneratedGoal[] = []

    ;(learner.diagnosis_domains || []).forEach((domain) => {
      const domainGoals = ADAPTIVE_GOALS[domain as keyof typeof ADAPTIVE_GOALS] || []
      domainGoals.forEach((goal) => {
        goals.push({
          domain: goal.domain as GeneratedGoal["domain"],
          goal_description: goal.suggestion,
          target_metric: goal.metric,
          timeline: "3 months",
          notes: "",
        })
      })
    })

    return goals
  }

  /**
   * Calculate progress summary (average rating per goal) from logs.
   */
  static calculateProgressSummary(logs: Pick<ProgressLog, "goal_id" | "rating">[]): Record<string, number> {
    const summary: Record<string, number> = {}

    logs.forEach((log) => {
      if (!summary[log.goal_id]) {
        summary[log.goal_id] = 0
      }
      summary[log.goal_id] += log.rating
    })

    // Calculate averages
    Object.keys(summary).forEach((goalId) => {
      const goalLogs = logs.filter((l) => l.goal_id === goalId)
      summary[goalId] = summary[goalId] / goalLogs.length
    })

    return summary
  }

  /**
   * Generate AI summary for IEP
   */
  static generateIEPSummary(learner: Pick<LearnerProfile, "name" | "age">, goals: GeneratedGoal[]): string {
    const goalCount = goals.length
    const domains = [...new Set(goals.map((g) => g.domain))].join(", ")

    return `This Individualized Education Plan (IEP) for ${learner.name} (age ${learner.age}) addresses ${goalCount} key developmental areas: ${domains}. The plan is tailored to support ${learner.name}'s neurodivergent profile and includes culturally-sensitive interventions appropriate for the African context. Regular progress monitoring and quarterly reviews will ensure the plan remains effective and responsive to ${learner.name}'s evolving needs.`
  }

  /**
   * Generate monthly report summary from normalized iep_goals + progress_logs
   */
  static generateMonthlyReportSummary(
    learner: Pick<LearnerProfile, "name">,
    logs: Pick<ProgressLog, "goal_id" | "rating">[],
    goals: Pick<IEPGoal, "id" | "goal_text">[],
  ): string {
    const progressSummary = this.calculateProgressSummary(logs)
    const topGoal = Object.entries(progressSummary).sort(([, a], [, b]) => b - a)[0]
    const topGoalData = goals.find((g) => g.id === topGoal?.[0])

    let summary = `Monthly progress report for ${learner.name}:\n\n`

    if (topGoalData) {
      const improvement = Math.round((topGoal[1] / 5) * 100)
      summary += `- ${topGoalData.goal_text} improved by ${improvement}% this month.\n`
    }

    summary += `- Total progress logs submitted: ${logs.length}\n`
    summary += `- Average progress rating: ${(Object.values(progressSummary).reduce((a, b) => a + b, 0) / Object.values(progressSummary).length).toFixed(1)}/5\n`
    summary += `- Recommended next step: Continue current interventions and monitor progress closely.`

    return summary
  }
}
