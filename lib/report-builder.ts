// Weekly summary, monthly report, quarterly IEP review and "What changed?"
// report (brief §21-23). Every finding says where it came from, and numbers
// are only shown where the goal's measurement rule supports them.

import { allGoals, summarisePerson, type JourneyGoal, type JourneyInput } from "@/lib/journey"
import { PROGRESS_STATUS_LABELS, progressStatus } from "@/lib/progress-status"

export type ReportKind = "weekly" | "monthly" | "quarterly" | "changes"
export type FindingSource = "assessment" | "observation" | "professional_input" | "ai_interpretation"

export const FINDING_SOURCE_LABELS: Record<FindingSource, string> = {
  assessment: "Assessment",
  observation: "Observation",
  professional_input: "Professional input",
  ai_interpretation: "AI interpretation",
}

export interface Finding {
  text: string
  source: FindingSource
}

export interface Report {
  kind: ReportKind
  title: string
  period: string
  sections: { heading: string; findings: Finding[] }[]
}

export const REPORT_TITLES: Record<ReportKind, string> = {
  weekly: "Weekly summary",
  monthly: "Monthly report",
  quarterly: "Quarterly IEP review",
  changes: "What changed?",
}

/** Section order used by the monthly report. */
export const MONTHLY_SECTIONS = [
  "Summary",
  "In their own words",
  "Goals and progress",
  "What changed",
  "Observations",
  "Professional input and assessments",
  "Next steps",
] as const

const DAY = 24 * 60 * 60 * 1000
const iso = (d: Date) => d.toISOString().slice(0, 10)

/**
 * Check-in ratings are a numeric measure only for goals measured by a
 * rating or a count (or older goals with no measurement recorded, which
 * were always tracked by the 1-5 check-in). Goals measured by observation
 * notes or work samples get words, not numbers.
 */
export function quantitativeSupported(goal: Pick<JourneyGoal, "measurement">): boolean {
  const m = goal.measurement?.toLowerCase() ?? ""
  return m === "" || /rating|count|how often|times|per week|per day|score/.test(m)
}

function logsBetween(g: JourneyGoal, from: string, to: string) {
  return (g.progress_logs ?? []).filter((l) => l.logged_date > from && l.logged_date <= to)
}

const fmt = (n: number) => n.toFixed(1)

function goalLine(g: JourneyGoal, asOf: Date): Finding {
  const s = progressStatus(g.progress_logs ?? [], asOf)
  const numbers =
    quantitativeSupported(g) && s.recent !== null
      ? ` (30-day average ${fmt(s.recent)}/5${s.previous !== null ? `, was ${fmt(s.previous)}` : ""})`
      : ""
  return { text: `${g.goal_text}: ${PROGRESS_STATUS_LABELS[s.status]}${numbers}`, source: "observation" }
}

function recordFindings(input: JourneyInput, from: string, to: string, name: string) {
  const inRange = (input.records ?? []).filter((r) => {
    const d = (r.record_date ?? r.created_at).slice(0, 10)
    return d > from && d <= to
  })
  const text = (r: (typeof inRange)[number]) =>
    `${r.title ?? r.record_type.replace(/_/g, " ")}${typeof r.fields?.summary === "string" ? `: ${r.fields.summary}` : ""}`
  const isVoice = (r: (typeof inRange)[number]) => r.record_type === "voice"
  return {
    voice: inRange.filter(isVoice).map(
      (r): Finding => ({
        text: `${r.fields?.speaker === "learner" ? name : "Family"}: “${String(r.fields?.summary ?? "")}”`,
        source: "observation",
      }),
    ),
    observations: inRange
      .filter((r) => (r.kind === "observation" || r.kind === "check_in") && !isVoice(r))
      .map((r): Finding => ({ text: text(r), source: "observation" })),
    professional: inRange
      .filter((r) => r.kind === "professional_input" || r.kind === "assessment")
      .map((r): Finding => ({ text: text(r), source: r.kind === "assessment" ? "assessment" : "professional_input" })),
  }
}

function changeLines(goals: JourneyGoal[], a: Date, b: Date): Finding[] {
  return goals.map((g) => {
    const before = progressStatus(g.progress_logs ?? [], a)
    const after = progressStatus(g.progress_logs ?? [], b)
    if (quantitativeSupported(g) && before.recent !== null && after.recent !== null) {
      const delta = after.recent - before.recent
      const word = delta >= 0.5 ? "higher" : delta <= -0.5 ? "lower" : "about the same"
      return {
        text: `${g.goal_text}: 30-day average ${fmt(before.recent)} then, ${fmt(after.recent)} now (${word}).`,
        source: "observation",
      }
    }
    return {
      text: `${g.goal_text}: ${PROGRESS_STATUS_LABELS[before.status]} then, ${PROGRESS_STATUS_LABELS[after.status]} now.`,
      source: "observation",
    }
  })
}

export function buildReport(
  kind: ReportKind,
  name: string,
  input: JourneyInput,
  { now = new Date(), from, to }: { now?: Date; from?: string; to?: string } = {},
): Report {
  const goals = allGoals(input).filter((g) => g.status === "in_progress" || g.status === "achieved")
  const days = kind === "weekly" ? 7 : kind === "monthly" ? 30 : 90
  const end = kind === "changes" && to ? new Date(`${to}T23:59:59Z`) : now
  const startDate = kind === "changes" && from ? new Date(`${from}T00:00:00Z`) : new Date(end.getTime() - days * DAY)
  const start = iso(startDate)
  const stop = iso(end)
  const checkIns = goals.reduce((n, g) => n + logsBetween(g, start, stop).length, 0)
  const { voice, observations, professional } = recordFindings(input, start, stop, name)
  const period = `${start} to ${stop}`
  const empty = (f: Finding[], text: string) => (f.length ? f : [{ text, source: "observation" as const }])

  if (kind === "changes") {
    return {
      kind,
      title: REPORT_TITLES.changes,
      period,
      sections: [
        { heading: `${name}: ${start} compared with ${stop}`, findings: empty(changeLines(goals, startDate, end), "No goals to compare yet.") },
        { heading: "Observations in between", findings: empty([...voice, ...observations], "None recorded.") },
        { heading: "Professional input and assessments in between", findings: empty(professional, "None recorded.") },
      ],
    }
  }

  const summary = summarisePerson(input, { now: end })
  const statusLines = goals.filter((g) => g.status === "in_progress").map((g) => goalLine(g, end))
  const achieved = goals
    .filter((g) => g.status === "achieved" && g.updated_at.slice(0, 10) > start)
    .map((g): Finding => ({ text: `Achieved: ${g.goal_text}`, source: "observation" }))

  const base = [
    { heading: "Summary", findings: [{ text: `${summary.headline} ${checkIns} check-in${checkIns === 1 ? "" : "s"} in this period.`, source: "observation" as const }] },
    { heading: "Goals and progress", findings: empty([...statusLines, ...achieved], "No goals yet.") },
  ]

  if (kind === "weekly") {
    return { kind, title: REPORT_TITLES.weekly, period, sections: [...base, { heading: "Observations", findings: empty(observations, "None recorded this week.") }] }
  }

  const nextSteps = summary.nextSteps.map((s): Finding => ({ text: s.label, source: "observation" }))
  const [summarySection, ...restOfBase] = base
  const sections = [
    summarySection,
    {
      heading: "In their own words",
      findings: empty(voice, `Nothing recorded in this period. Add what ${name} or their family says on the profile page.`),
    },
    ...restOfBase,
    { heading: "What changed", findings: empty(changeLines(goals.filter((g) => g.status === "in_progress"), startDate, end), "Not enough check-ins to compare yet.") },
    { heading: "Observations", findings: empty(observations, "None recorded in this period.") },
    { heading: "Professional input and assessments", findings: empty(professional, "None added in this period.") },
  ]

  if (kind === "quarterly") {
    const reviews = goals
      .filter((g) => g.status === "in_progress")
      .map((g): Finding => ({
        text: `${g.goal_text}: started from "${g.baseline ?? "not recorded"}", aiming for "${g.target ?? "not recorded"}"${g.review_date ? `, review by ${g.review_date}` : ""}.`,
        source: "observation",
      }))
    sections.splice(3, 0, { heading: "Baseline, target and review dates", findings: empty(reviews, "No goals yet.") })
  }

  sections.push({ heading: "Next steps", findings: empty(nextSteps, "Keep going with regular check-ins.") })
  return { kind, title: REPORT_TITLES[kind], period, sections }
}
