// "My Journey" -- pure functions that turn data ANDA already stores (IEPs,
// goals, progress logs, reports, progress snapshots) into a person-centred
// view: how is this person doing, what are we working on, what's next, and
// a chronological timeline. No new tables; everything here is derived.

export interface JourneyLog {
  id: string
  rating: number
  notes: string | null
  logged_date: string
  created_at: string
}

export interface JourneyGoal {
  id: string
  goal_text: string
  domain: string | null
  status: string
  baseline?: string | null
  target?: string | null
  measurement?: string | null
  created_at: string
  updated_at: string
  progress_logs: JourneyLog[] | null
}

export interface JourneyIEP {
  id: string
  title: string | null
  status: string
  created_at: string
  custom_goals: { notes?: string | null }[] | null
  iep_goals: JourneyGoal[] | null
}

export interface JourneyReport {
  id: string
  report_type: string | null
  report_period: string | null
  created_at: string
}

export interface JourneySnapshot {
  id: string
  week_start_date: string | null
  summary_text: string | null
  domain_progress?: Record<string, number> | null
  created_at: string
}

export interface SnapshotChange {
  domain: string
  before: number | null
  after: number | null
  change: number | null
  direction: "better" | "worse" | "same" | "new" | "dropped"
}

export const SNAPSHOT_WINDOW_DAYS = 30

/**
 * A progress snapshot: average check-in rating per area over the last 30
 * days (not all-time, so two snapshots a month apart actually differ).
 * Null when there are no recent check-ins.
 */
export function snapshotFromGoals(
  goals: { domain: string | null; progress_logs: { rating: number; logged_date: string }[] | null }[],
  now: Date = new Date(),
): { domainAverages: Record<string, number>; summaryText: string } | null {
  const since = new Date(now.getTime() - SNAPSHOT_WINDOW_DAYS * DAY_MS).toISOString().slice(0, 10)
  const byDomain: Record<string, number[]> = {}

  for (const goal of goals) {
    for (const log of goal.progress_logs ?? []) {
      if (log.logged_date < since) continue
      ;(byDomain[goal.domain || "general"] ??= []).push(log.rating)
    }
  }

  const domains = Object.keys(byDomain)
  if (domains.length === 0) return null

  const domainAverages = Object.fromEntries(
    domains.map((d) => [d, Math.round((byDomain[d].reduce((s, r) => s + r, 0) / byDomain[d].length) * 100) / 100]),
  )
  const overall = Object.values(domainAverages).reduce((s, v) => s + v, 0) / domains.length
  const checkIns = Object.values(byDomain).reduce((s, r) => s + r.length, 0)

  return {
    domainAverages,
    summaryText: `Last ${SNAPSHOT_WINDOW_DAYS} days: ${checkIns} check-in${checkIns === 1 ? "" : "s"} across ${domains.length} area${
      domains.length === 1 ? "" : "s"
    }, averaging ${overall.toFixed(1)}/5.`,
  }
}

/** "What changed?" between two progress snapshots, per area (avg rating /5). */
export function compareSnapshots(from: JourneySnapshot, to: JourneySnapshot): SnapshotChange[] {
  const a = from.domain_progress ?? {}
  const b = to.domain_progress ?? {}
  const domains = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort()

  return domains.map((domain) => {
    const before = typeof a[domain] === "number" ? a[domain] : null
    const after = typeof b[domain] === "number" ? b[domain] : null
    if (before === null) return { domain, before, after, change: null, direction: "new" }
    if (after === null) return { domain, before, after, change: null, direction: "dropped" }
    const change = Math.round((after - before) * 100) / 100
    // Under a quarter-point either way is noise on a 1-5 scale.
    const direction = change >= 0.25 ? "better" : change <= -0.25 ? "worse" : "same"
    return { domain, before, after, change, direction }
  })
}

export interface JourneyRecord {
  id: string
  kind: string // observation | professional_input | assessment | check_in (scripts/042)
  record_type: string
  title: string | null
  record_date: string | null
  fields: Record<string, unknown> | null
  created_at: string
}

export interface JourneyInput {
  ieps: JourneyIEP[]
  reports: JourneyReport[]
  summaries: JourneySnapshot[]
  records?: JourneyRecord[]
}

export type TimelineKind =
  | "plan"
  | "assessment"
  | "goal"
  | "achieved"
  | "progress"
  | "report"
  | "snapshot"
  | "check_in"
  | "observation"
  | "professional_input"

export interface TimelineEvent {
  id: string
  date: string
  kind: TimelineKind
  title: string
  detail?: string
}

const DAY_MS = 24 * 60 * 60 * 1000

export function allGoals(input: Pick<JourneyInput, "ieps">): JourneyGoal[] {
  return input.ieps.flatMap((iep) => iep.iep_goals ?? [])
}

/** Logs newest first. */
export function sortedLogs(goal: JourneyGoal): JourneyLog[] {
  return [...(goal.progress_logs ?? [])].sort(
    (a, b) => b.logged_date.localeCompare(a.logged_date) || b.created_at.localeCompare(a.created_at),
  )
}

export interface GoalTrend {
  latest: number | null
  recentAverage: number | null
  direction: "up" | "down" | "steady" | null
  count: number
}

/** Compares the last 3 check-ins against the 3 before them. */
export function goalTrend(goal: JourneyGoal): GoalTrend {
  const logs = sortedLogs(goal)
  if (logs.length === 0) return { latest: null, recentAverage: null, direction: null, count: 0 }

  const avg = (xs: JourneyLog[]) => xs.reduce((s, l) => s + l.rating, 0) / xs.length
  const recent = logs.slice(0, 3)
  const before = logs.slice(3, 6)
  const recentAverage = avg(recent)
  let direction: GoalTrend["direction"] = null
  if (before.length > 0) {
    const delta = recentAverage - avg(before)
    direction = delta >= 0.5 ? "up" : delta <= -0.5 ? "down" : "steady"
  }

  return { latest: logs[0].rating, recentAverage, direction, count: logs.length }
}

/** Every dated thing that has happened, newest first. */
export function buildTimeline(input: JourneyInput): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const iep of input.ieps) {
    events.push({ id: `plan-${iep.id}`, date: iep.created_at, kind: "plan", title: `Plan created: ${iep.title || "IEP"}` })

    // Assessment hook: goals imported from a Neu Rafiki assessment carry an
    // "Imported from Neu Rafiki assessment" note in ieps.custom_goals. When
    // assessments get their own table, add them here as their own source.
    const imported = (iep.custom_goals ?? []).filter((g) => g.notes?.startsWith("Imported from Neu Rafiki")).length
    if (imported > 0) {
      events.push({
        id: `assessment-${iep.id}`,
        date: iep.created_at,
        kind: "assessment",
        title: "Assessment results used to shape the plan",
        detail: `${imported} goal${imported === 1 ? "" : "s"} came from a Neu Rafiki assessment.`,
      })
    }

    for (const goal of iep.iep_goals ?? []) {
      events.push({ id: `goal-${goal.id}`, date: goal.created_at, kind: "goal", title: `Goal set: ${goal.goal_text}` })
      if (goal.status === "achieved") {
        events.push({ id: `achieved-${goal.id}`, date: goal.updated_at, kind: "achieved", title: `Goal achieved: ${goal.goal_text}` })
      }
      for (const log of goal.progress_logs ?? []) {
        events.push({
          id: `progress-${log.id}`,
          date: log.logged_date,
          kind: "progress",
          title: `Check-in on "${goal.goal_text}": ${log.rating}/5`,
          detail: log.notes || undefined,
        })
      }
    }
  }

  for (const report of input.reports) {
    events.push({
      id: `report-${report.id}`,
      date: report.created_at,
      kind: "report",
      title: `${report.report_type === "quarterly" ? "Quarterly" : "Monthly"} report generated`,
      detail: report.report_period || undefined,
    })
  }

  for (const r of input.records ?? []) {
    const kind: TimelineKind =
      r.kind === "check_in" ? "check_in" : r.kind === "assessment" ? "assessment" : r.kind === "observation" ? "observation" : "professional_input"
    const summary = typeof r.fields?.summary === "string" ? r.fields.summary : undefined
    events.push({
      id: `record-${r.id}`,
      date: r.record_date ?? r.created_at,
      kind,
      title: r.title || (r.record_type === "support_profile" ? "Support profile updated" : "Record added"),
      detail: summary,
    })
  }

  for (const snap of input.summaries) {
    events.push({
      id: `snapshot-${snap.id}`,
      date: snap.created_at,
      kind: "snapshot",
      title: "Progress snapshot saved",
      detail: snap.summary_text || undefined,
    })
  }

  // Dates are ISO strings (date or timestamp), so string order is time order.
  return events.sort((a, b) => b.date.localeCompare(a.date))
}

export interface NextStep {
  label: string
  href?: string
}

export interface PersonSummary {
  headline: string
  strengths: string[]
  priorities: { goalId: string; text: string; reason: string }[]
  nextSteps: NextStep[]
}

/** "How is this person doing, what are we working on, what's next." */
export function summarisePerson(
  input: JourneyInput,
  { now = new Date(), canReports = false, journeyHref = "" }: { now?: Date; canReports?: boolean; journeyHref?: string } = {},
): PersonSummary {
  const goals = allGoals(input)
  const active = goals.filter((g) => g.status === "in_progress")
  const trends = new Map(goals.map((g) => [g.id, goalTrend(g)]))
  const logged = goals.filter((g) => trends.get(g.id)!.count > 0)

  let headline: string
  if (input.ieps.length === 0) {
    headline = "No plan yet."
  } else if (logged.length === 0) {
    headline = `Working on ${active.length} goal${active.length === 1 ? "" : "s"}. No check-ins logged yet.`
  } else {
    const mean = logged.reduce((s, g) => s + trends.get(g.id)!.recentAverage!, 0) / logged.length
    const ups = logged.filter((g) => trends.get(g.id)!.direction === "up").length
    const downs = logged.filter((g) => trends.get(g.id)!.direction === "down").length
    const drift = ups > downs ? ", mostly improving" : downs > ups ? ", with some goals slipping" : ""
    headline = `Recent check-ins average ${mean.toFixed(1)}/5 across ${logged.length} goal${
      logged.length === 1 ? "" : "s"
    }${drift}.`
  }

  const strengths = [
    ...goals.filter((g) => g.status === "achieved").map((g) => `Achieved: ${g.goal_text}`),
    ...active
      .filter((g) => (trends.get(g.id)!.recentAverage ?? 0) >= 4)
      .map((g) => `Doing well: ${g.goal_text}`),
  ]

  const priorities = active
    .map((g) => {
      const t = trends.get(g.id)!
      const reason =
        t.count === 0
          ? "No check-ins yet"
          : t.direction === "down"
            ? `Slipping (recent ${t.recentAverage!.toFixed(1)}/5)`
            : `Recent ${t.recentAverage!.toFixed(1)}/5`
      // Unlogged first, then slipping, then lowest recent average.
      const score = t.count === 0 ? -2 : (t.direction === "down" ? -1 : 0) + t.recentAverage! / 10
      return { goalId: g.id, text: g.goal_text, reason, score }
    })
    .filter((p) => p.score < 0.4) // skip goals already going well (recent >= 4)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(({ goalId, text, reason }) => ({ goalId, text, reason }))

  const nextSteps: NextStep[] = []
  if (input.ieps.length === 0) {
    nextSteps.push({ label: "Create a first plan", href: "/iep/generate" })
  }
  const unlogged = active.find((g) => trends.get(g.id)!.count === 0)
  if (unlogged) {
    nextSteps.push({ label: `Log a first check-in for "${unlogged.goal_text}"`, href: journeyHref || undefined })
  }
  const lastLog = goals
    .flatMap((g) => g.progress_logs ?? [])
    .map((l) => l.logged_date)
    .sort()
    .pop()
  if (lastLog) {
    const days = Math.floor((now.getTime() - new Date(lastLog).getTime()) / DAY_MS)
    if (days >= 14) nextSteps.push({ label: `It's been ${days} days since the last check-in`, href: journeyHref || undefined })
  }
  const nearlyThere = active.find((g) => {
    const t = trends.get(g.id)!
    return t.count >= 3 && (t.recentAverage ?? 0) >= 4.5
  })
  if (nearlyThere) {
    nextSteps.push({ label: `Review whether "${nearlyThere.goal_text}" is achieved`, href: journeyHref || undefined })
  }
  if (canReports && logged.length > 0) {
    const lastReport = input.reports.map((r) => r.created_at).sort().pop()
    if (!lastReport || now.getTime() - new Date(lastReport).getTime() >= 30 * DAY_MS) {
      nextSteps.push({ label: "Generate a monthly progress report", href: "/iep/reports" })
    }
  }

  return { headline, strengths, priorities, nextSteps }
}
