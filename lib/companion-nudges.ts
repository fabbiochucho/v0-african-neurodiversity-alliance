// The default AI Companion experience, built entirely from the learner's own
// data -- no AI model, no third party, available on every tier. Pure
// functions so each nudge rule is unit tested.

export interface NudgeLog {
  rating: number
  logged_date: string // YYYY-MM-DD
}

export interface NudgeGoal {
  id: string
  goal_text: string
  domain: string | null
  status: string
  target_completion_date: string | null
  progress_logs: NudgeLog[] | null
}

export type NudgeKind = "check_in" | "stalled" | "review_soon" | "encouragement"

export interface Nudge {
  kind: NudgeKind
  goalId?: string
  text: string
}

const DAY_MS = 24 * 60 * 60 * 1000
const day = (d: Date) => d.toISOString().slice(0, 10)
const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length

/** Average check-in rating per area: last 30 days vs the 30 days before. */
export function thirtyDayChange(goals: NudgeGoal[], now: Date = new Date()) {
  const cut1 = day(new Date(now.getTime() - 30 * DAY_MS))
  const cut2 = day(new Date(now.getTime() - 60 * DAY_MS))
  const recent: Record<string, number[]> = {}
  const before: Record<string, number[]> = {}

  for (const g of goals) {
    const area = g.domain || "general"
    for (const l of g.progress_logs ?? []) {
      if (l.logged_date >= cut1) (recent[area] ??= []).push(l.rating)
      else if (l.logged_date >= cut2) (before[area] ??= []).push(l.rating)
    }
  }

  return Object.keys(recent)
    .filter((area) => before[area])
    .map((area) => ({ area, now: avg(recent[area]), then: avg(before[area]) }))
}

/**
 * Check-in prompts, "next step" nudges for stalled goals or near review
 * dates, and encouragement when an area's 30-day average has risen.
 * Ordered most-actionable first.
 */
export function buildNudges(name: string, goals: NudgeGoal[], now: Date = new Date()): Nudge[] {
  const nudges: Nudge[] = []
  const today = day(now)
  const weekAgo = day(new Date(now.getTime() - 7 * DAY_MS))
  const monthAgo = day(new Date(now.getTime() - 30 * DAY_MS))
  const soon = day(new Date(now.getTime() + 14 * DAY_MS))

  for (const g of goals.filter((x) => x.status === "in_progress")) {
    const logs = [...(g.progress_logs ?? [])].sort((a, b) => b.logged_date.localeCompare(a.logged_date))

    if (g.target_completion_date && g.target_completion_date <= soon) {
      const when = g.target_completion_date < today ? `was due on ${g.target_completion_date}` : `is on ${g.target_completion_date}`
      nudges.push({
        kind: "review_soon",
        goalId: g.id,
        text: `The review date for "${g.goal_text}" ${when}. Next step: decide together whether it's achieved, needs more time, or should change.`,
      })
    }

    const recent = logs.filter((l) => l.logged_date >= monthAgo)
    const last3 = recent.slice(0, 3).map((l) => l.rating)
    const prev3 = recent.slice(3, 6).map((l) => l.rating)
    const stalled =
      last3.length === 3 && (Math.max(...last3) <= 2 || (prev3.length > 0 && avg(last3) <= avg(prev3) - 0.5))
    if (stalled) {
      nudges.push({
        kind: "stalled",
        goalId: g.id,
        text: `"${g.goal_text}" seems stuck lately. Next step: try a smaller first step, change when or where you practise, or talk it through with someone who supports ${name}.`,
      })
    }

    if (!logs[0] || logs[0].logged_date < weekAgo) {
      nudges.push({
        kind: "check_in",
        goalId: g.id,
        text: logs[0]
          ? `How has "${g.goal_text}" gone this week? A quick check-in keeps ${name}'s journey up to date.`
          : `No check-ins yet for "${g.goal_text}". Log how it's going to start seeing progress.`,
      })
    }
  }

  for (const { area, now: n, then } of thirtyDayChange(goals, now)) {
    if (n - then >= 0.25) {
      nudges.push({
        kind: "encouragement",
        text: `${area[0].toUpperCase()}${area.slice(1)} check-ins average ${n.toFixed(1)}/5 over the last 30 days, up from ${then.toFixed(1)}. That's real progress for ${name}.`,
      })
    }
  }

  const order: Record<NudgeKind, number> = { review_soon: 0, stalled: 1, check_in: 2, encouragement: 3 }
  return nudges.sort((a, b) => order[a.kind] - order[b.kind])
}

// Words a learning_resources title/description must mention to be offered
// for a goal area. Plain keyword matching on real directory entries: it
// never invents a resource, it can only miss one.
const AREA_KEYWORDS: Record<string, string[]> = {
  communication: ["communicat", "speech", "language", "social"],
  sensory: ["sensory", "sensor"],
  academic: ["reading", "dyslexi", "literacy", "learning", "classroom", "teacher", "inclusive education"],
  motor: ["motor", "dyspraxi", "occupational", "coordination"],
  attention: ["adhd", "attention", "focus", "executive"],
  behavior: ["behavio", "positive support", "autism", "emotional", "regulation"],
}

export interface ResourceLike {
  id: string
  title: string
  description: string | null
  url: string | null
  provider: string | null
}

export function matchResources<T extends ResourceLike>(resources: T[], areas: string[], limit = 3): T[] {
  const words = areas.flatMap((a) => AREA_KEYWORDS[a] ?? [])
  if (words.length === 0) return []
  return resources
    .map((r) => {
      const hay = `${r.title} ${r.description ?? ""}`.toLowerCase()
      return { r, score: words.filter((w) => hay.includes(w)).length }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.r)
}
