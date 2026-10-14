import { describe, expect, it } from "vitest"
import {
  buildTimeline,
  compareSnapshots,
  goalTrend,
  snapshotFromGoals,
  summarisePerson,
  type JourneyGoal,
  type JourneyInput,
} from "@/lib/journey"

describe("snapshotFromGoals", () => {
  const now = new Date("2026-03-31T12:00:00Z")

  it("averages only the last 30 days per area", () => {
    const snap = snapshotFromGoals(
      [
        { domain: "academic", progress_logs: [{ rating: 4, logged_date: "2026-03-20" }, { rating: 2, logged_date: "2026-03-25" }] },
        { domain: "academic", progress_logs: [{ rating: 1, logged_date: "2026-01-01" }] },
        { domain: null, progress_logs: [{ rating: 5, logged_date: "2026-03-30" }] },
      ],
      now,
    )
    expect(snap?.domainAverages).toEqual({ academic: 3, general: 5 })
    expect(snap?.summaryText).toBe("Last 30 days: 3 check-ins across 2 areas, averaging 4.0/5.")
  })

  it("returns null (not NaN) with no recent check-ins", () => {
    expect(snapshotFromGoals([{ domain: "motor", progress_logs: [] }], now)).toBeNull()
  })
})

describe("compareSnapshots", () => {
  const snap = (id: string, domain_progress: Record<string, number>) => ({
    id,
    week_start_date: null,
    summary_text: null,
    domain_progress,
    created_at: "2026-01-01T00:00:00Z",
  })

  it("reports per-area change, ignoring sub-quarter-point noise, and new/dropped areas", () => {
    const rows = compareSnapshots(
      snap("a", { academic: 2, sensory: 4, motor: 3 }),
      snap("b", { academic: 3.5, sensory: 3.6, communication: 2 }),
    )
    expect(rows).toEqual([
      { domain: "academic", before: 2, after: 3.5, change: 1.5, direction: "better" },
      { domain: "communication", before: null, after: 2, change: null, direction: "new" },
      { domain: "motor", before: 3, after: null, change: null, direction: "dropped" },
      { domain: "sensory", before: 4, after: 3.6, change: -0.4, direction: "worse" },
    ])
    expect(compareSnapshots(snap("a", { x: 3 }), snap("b", { x: 3.2 }))[0].direction).toBe("same")
  })
})

let n = 0
const log = (rating: number, logged_date: string) => ({
  id: `log-${++n}`,
  rating,
  notes: null,
  logged_date,
  created_at: `${logged_date}T12:00:00Z`,
})

const goal = (overrides: Partial<JourneyGoal>): JourneyGoal => ({
  id: `goal-${++n}`,
  goal_text: "Read a short paragraph aloud",
  domain: "academic",
  status: "in_progress",
  created_at: "2026-01-01T09:00:00Z",
  updated_at: "2026-01-01T09:00:00Z",
  progress_logs: [],
  ...overrides,
})

const input = (goals: JourneyGoal[], extra: Partial<JourneyInput> = {}): JourneyInput => ({
  ieps: [{ id: "iep-1", title: "IEP for Ada", status: "draft", created_at: "2026-01-01T08:00:00Z", custom_goals: [], iep_goals: goals }],
  reports: [],
  summaries: [],
  ...extra,
})

describe("goalTrend", () => {
  it("has no trend without logs", () => {
    expect(goalTrend(goal({}))).toEqual({ latest: null, recentAverage: null, direction: null, count: 0 })
  })

  it("compares the latest three check-ins to the three before", () => {
    const g = goal({
      progress_logs: [
        log(2, "2026-02-01"),
        log(2, "2026-02-02"),
        log(2, "2026-02-03"),
        log(4, "2026-02-04"),
        log(4, "2026-02-05"),
        log(5, "2026-02-06"),
      ],
    })
    const t = goalTrend(g)
    expect(t.latest).toBe(5)
    expect(t.recentAverage).toBeCloseTo(13 / 3)
    expect(t.direction).toBe("up")
  })
})

describe("buildTimeline", () => {
  it("merges plans, goals, check-ins, achievements, reports and snapshots newest first", () => {
    const g1 = goal({ id: "g1", progress_logs: [log(3, "2026-02-01")] })
    const g2 = goal({ id: "g2", status: "achieved", updated_at: "2026-03-01T10:00:00Z" })
    const events = buildTimeline(
      input([g1, g2], {
        reports: [{ id: "r1", report_type: "monthly", report_period: "Feb 2026", created_at: "2026-02-28T10:00:00Z" }],
        summaries: [{ id: "s1", week_start_date: "2026-02-08", summary_text: "Good week", created_at: "2026-02-10T10:00:00Z" }],
      }),
    )
    expect(events.map((e) => e.kind)).toEqual(["achieved", "report", "snapshot", "progress", "goal", "goal", "plan"])
    expect(events.every((e, i) => i === 0 || events[i - 1].date >= e.date)).toBe(true)
  })

  it("adds an assessment event when goals were imported from Neu Rafiki", () => {
    const data = input([])
    data.ieps[0].custom_goals = [{ notes: "Imported from Neu Rafiki assessment (ADHD)." }, { notes: "" }]
    const assessment = buildTimeline(data).find((e) => e.kind === "assessment")
    expect(assessment?.detail).toBe("1 goal came from a Neu Rafiki assessment.")
  })
})

describe("summarisePerson", () => {
  const now = new Date("2026-03-01T00:00:00Z")

  it("suggests creating a plan when there is none", () => {
    const s = summarisePerson({ ieps: [], reports: [], summaries: [] }, { now })
    expect(s.headline).toBe("No plan yet.")
    expect(s.nextSteps[0]).toEqual({ label: "Create a first plan", href: "/iep/generate" })
  })

  it("puts unlogged and slipping goals in priorities, strong goals in strengths", () => {
    const unlogged = goal({ goal_text: "Unlogged" })
    const slipping = goal({
      goal_text: "Slipping",
      progress_logs: [4, 4, 4, 2, 2, 2].map((r, i) => log(r, `2026-02-0${i + 1}`)),
    })
    const strong = goal({ goal_text: "Strong", progress_logs: [log(5, "2026-02-20"), log(4, "2026-02-21")] })
    const done = goal({ goal_text: "Done", status: "achieved" })

    const s = summarisePerson(input([strong, slipping, unlogged, done]), { now })
    expect(s.priorities.map((p) => p.text)).toEqual(["Unlogged", "Slipping"])
    expect(s.strengths).toEqual(["Achieved: Done", "Doing well: Strong"])
    expect(s.headline).toMatch(/^Recent check-ins average .*across 2 goals, with some goals needing attention.$/)
    expect(s.nextSteps[0].label).toBe('Log a first check-in for "Unlogged"')
  })

  it("nudges after two quiet weeks and suggests a report only when the plan allows it", () => {
    const g = goal({ progress_logs: [log(3, "2026-02-01")] })
    const withoutReports = summarisePerson(input([g]), { now, canReports: false })
    expect(withoutReports.nextSteps.map((x) => x.label)).toEqual(["It's been 28 days since the last check-in"])

    const withReports = summarisePerson(input([g]), { now, canReports: true })
    expect(withReports.nextSteps.map((x) => x.label)).toContain("Generate a monthly progress report")
  })
})
