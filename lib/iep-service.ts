// IEP Service - Business Logic

import type { IEPGoal, ProgressLog, Profile } from "./types/iep"
import { ADAPTIVE_GOALS } from "./constants/iep"

export class IEPService {
  /**
   * Generate adaptive IEP goals based on screening results
   */
  static generateAdaptiveGoals(profile: Profile): IEPGoal[] {
    const goals: IEPGoal[] = []

    profile.diagnosis_domains.forEach((domain) => {
      const domainGoals = ADAPTIVE_GOALS[domain as keyof typeof ADAPTIVE_GOALS] || []
      domainGoals.forEach((goal) => {
        goals.push({
          goal_id: `goal_${Date.now()}_${Math.random()}`,
          domain: goal.domain as any,
          goal_description: goal.suggestion,
          target_metric: goal.metric,
          timeline: "3 months",
          status: "ongoing",
          notes: "",
          created_at: new Date(),
          updated_at: new Date(),
        })
      })
    })

    return goals
  }

  /**
   * Calculate progress summary from logs
   */
  static calculateProgressSummary(logs: ProgressLog[]): Record<string, number> {
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
  static generateIEPSummary(profile: Profile, goals: IEPGoal[]): string {
    const goalCount = goals.length
    const domains = [...new Set(goals.map((g) => g.domain))].join(", ")

    return `This Individualized Education Plan (IEP) for ${profile.name} (age ${profile.age}) addresses ${goalCount} key developmental areas: ${domains}. The plan is tailored to support ${profile.name}'s neurodivergent profile and includes culturally-sensitive interventions appropriate for the African context. Regular progress monitoring and quarterly reviews will ensure the plan remains effective and responsive to ${profile.name}'s evolving needs.`
  }

  /**
   * Generate monthly report summary
   */
  static generateMonthlyReportSummary(profile: Profile, logs: ProgressLog[], goals: IEPGoal[]): string {
    const progressSummary = this.calculateProgressSummary(logs)
    const topGoal = Object.entries(progressSummary).sort(([, a], [, b]) => b - a)[0]
    const topGoalData = goals.find((g) => g.goal_id === topGoal?.[0])

    let summary = `Monthly progress report for ${profile.name}:\n\n`

    if (topGoalData) {
      const improvement = Math.round((topGoal[1] / 5) * 100)
      summary += `- ${topGoalData.goal_description} improved by ${improvement}% this month.\n`
    }

    summary += `- Total progress logs submitted: ${logs.length}\n`
    summary += `- Average progress rating: ${(Object.values(progressSummary).reduce((a, b) => a + b, 0) / Object.values(progressSummary).length).toFixed(1)}/5\n`
    summary += `- Recommended next step: Continue current interventions and monitor progress closely.`

    return summary
  }
}
