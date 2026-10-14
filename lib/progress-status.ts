// Progress wording (brief §21). Plain words, never red/green KPI styling.
//
// Rules, applied in this order to a goal's check-in ratings (1-5):
//   R = average of check-ins in the last 30 days (needs >= 1 check-in)
//   P = average of check-ins in the 30 days before that (days 31-60)
//   1. New             -- fewer than 2 check-ins in total
//   2. Needs attention -- no check-in in the last 30 days, or R <= 2.0,
//                         or P exists and R is at least 0.5 lower than P
//   3. Doing better    -- P exists and R is at least 0.5 higher than P
//   4. Consistent      -- R >= 4.0
//   5. Emerging        -- 2.0 < R < 3.0
//   6. Stable          -- anything else (R from 3.0 to 3.9, no 0.5 change)

export type ProgressStatus = "new" | "needs_attention" | "doing_better" | "consistent" | "emerging" | "stable"

export const PROGRESS_STATUS_LABELS: Record<ProgressStatus, string> = {
  new: "New",
  needs_attention: "Needs attention",
  doing_better: "Doing better",
  consistent: "Consistent",
  emerging: "Emerging",
  stable: "Stable",
}

export const PROGRESS_STATUS_RULES: Record<ProgressStatus, string> = {
  new: "Fewer than 2 check-ins so far.",
  needs_attention: "No check-in in the last 30 days, a 30-day average of 2 or less, or a drop of half a point or more.",
  doing_better: "The 30-day average is at least half a point higher than the 30 days before.",
  consistent: "The 30-day average is 4 or more.",
  emerging: "The 30-day average is between 2 and 3.",
  stable: "No change of half a point or more, with a 30-day average from 3 to 3.9.",
}

const DAY = 24 * 60 * 60 * 1000
const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null)

export interface StatusResult {
  status: ProgressStatus
  recent: number | null
  previous: number | null
}

export function progressStatus(logs: { rating: number; logged_date: string }[], now: Date = new Date()): StatusResult {
  const d30 = new Date(now.getTime() - 30 * DAY).toISOString().slice(0, 10)
  const d60 = new Date(now.getTime() - 60 * DAY).toISOString().slice(0, 10)
  const today = now.toISOString().slice(0, 10)
  // Only check-ins up to "now", so a status can be computed as of a past date.
  logs = logs.filter((l) => l.logged_date <= today)
  const recent = avg(logs.filter((l) => l.logged_date > d30).map((l) => l.rating))
  const previous = avg(logs.filter((l) => l.logged_date > d60 && l.logged_date <= d30).map((l) => l.rating))
  const r = { recent, previous }

  if (logs.length < 2) return { status: "new", ...r }
  if (recent === null || recent <= 2 || (previous !== null && recent - previous <= -0.5)) return { status: "needs_attention", ...r }
  if (previous !== null && recent - previous >= 0.5) return { status: "doing_better", ...r }
  if (recent >= 4) return { status: "consistent", ...r }
  if (recent > 2 && recent < 3) return { status: "emerging", ...r }
  return { status: "stable", ...r }
}
