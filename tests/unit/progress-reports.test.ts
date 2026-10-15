import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { progressStatus, PROGRESS_STATUS_LABELS } from "@/lib/progress-status"
import { buildReport, MONTHLY_SECTIONS, quantitativeSupported } from "@/lib/report-builder"
import type { JourneyGoal, JourneyInput } from "@/lib/journey"

const now = new Date("2026-06-30T12:00:00Z")
const day = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString().slice(0, 10)
const logs = (pairs: [number, number][]) => pairs.map(([ago, rating]) => ({ rating, logged_date: day(ago) }))

describe("progress status rules (brief §21)", () => {
  it("New: fewer than 2 check-ins", () => {
    expect(progressStatus(logs([[1, 5]]), now).status).toBe("new")
  })
  it("Needs attention: nothing in 30 days, low average, or a drop", () => {
    expect(progressStatus(logs([[40, 4], [45, 4]]), now).status).toBe("needs_attention")
    expect(progressStatus(logs([[1, 2], [3, 2]]), now).status).toBe("needs_attention")
    expect(progressStatus(logs([[1, 3], [3, 3], [40, 4], [45, 4]]), now).status).toBe("needs_attention")
  })
  it("Doing better: up by half a point or more", () => {
    expect(progressStatus(logs([[1, 4], [3, 4], [40, 3], [45, 3]]), now).status).toBe("doing_better")
  })
  it("Consistent, Emerging, Stable", () => {
    expect(progressStatus(logs([[1, 4], [3, 5]]), now).status).toBe("consistent")
    expect(progressStatus(logs([[1, 2], [3, 3]]), now).status).toBe("emerging")
    expect(progressStatus(logs([[1, 3], [3, 4]]), now).status).toBe("stable")
  })
  it("uses the brief's words", () => {
    expect(Object.values(PROGRESS_STATUS_LABELS).sort()).toEqual(
      ["Consistent", "Doing better", "Emerging", "Needs attention", "New", "Stable"].sort(),
    )
  })
  it("no red/green KPI styling on the status chip", () => {
    const page = readFileSync("app/journey/[learnerId]/page.tsx", "utf8")
    const chip = page.slice(page.indexOf("PROGRESS_STATUS_LABELS[status.status]") - 250, page.indexOf("PROGRESS_STATUS_LABELS[status.status]"))
    expect(chip).not.toMatch(/(red|green|destructive|emerald|rose)-/)
  })
})

const goal = (o: Partial<JourneyGoal>): JourneyGoal => ({
  id: "g1",
  goal_text: "Read aloud",
  domain: "academic",
  status: "in_progress",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  progress_logs: [],
  ...o,
})
const input = (goals: JourneyGoal[], records: JourneyInput["records"] = []): JourneyInput => ({
  ieps: [{ id: "i", title: "Plan", status: "active", created_at: "2026-01-01T00:00:00Z", custom_goals: [], iep_goals: goals }],
  reports: [],
  summaries: [],
  records,
})
const withLogs = (pairs: [number, number][]) =>
  pairs.map(([ago, rating], i) => ({ id: `l${i}`, rating, notes: null, logged_date: day(ago), created_at: `${day(ago)}T10:00:00Z` }))

describe("reports (brief §22-23)", () => {
  it("shows numbers only where the measurement rule supports them", () => {
    expect(quantitativeSupported({ measurement: "Check-in rating (1-5) each week" })).toBe(true)
    expect(quantitativeSupported({ measurement: "Count how often it happens each week" })).toBe(true)
    expect(quantitativeSupported({ measurement: "Observation notes from home or school" })).toBe(false)
    expect(quantitativeSupported({ measurement: null })).toBe(true)

    const rated = goal({ progress_logs: withLogs([[1, 4], [3, 4], [40, 3], [45, 3]]) })
    const observed = goal({ id: "g2", goal_text: "Joins group play", measurement: "Observation notes from home or school", progress_logs: withLogs([[1, 4], [3, 4], [40, 3], [45, 3]]) })
    const r = buildReport("monthly", "Ada", input([rated, observed]), { now })
    const lines = r.sections.find((s) => s.heading === "Goals and progress")!.findings.map((f) => f.text)
    expect(lines[0]).toMatch(/Read aloud: Doing better \(30-day average 4\.0\/5, was 3\.0\)/)
    expect(lines[1]).toBe("Joins group play: Doing better")
  })

  it("monthly report uses the section list in order, and every finding is labelled", () => {
    const r = buildReport("monthly", "Ada", input([goal({})]), { now })
    expect(r.sections.map((s) => s.heading)).toEqual([...MONTHLY_SECTIONS])
    for (const s of r.sections) for (const f of s.findings) expect(["assessment", "observation", "professional_input", "ai_interpretation"]).toContain(f.source)
  })

  it("labels professional input and assessments by kind", () => {
    const r = buildReport(
      "monthly",
      "Ada",
      input([goal({})], [
        { id: "r1", kind: "professional_input", record_type: "diagnosis", title: "Diagnosis", record_date: day(5), fields: { summary: "ADHD" }, created_at: day(5) },
        { id: "r2", kind: "assessment", record_type: "neurafiki_assessment", title: "NeuRafiki", record_date: day(6), fields: {}, created_at: day(6) },
      ]),
      { now },
    )
    const findings = r.sections.find((s) => s.heading === "Professional input and assessments")!.findings
    expect(findings.map((f) => f.source)).toEqual(["professional_input", "assessment"])
  })

  it("puts the person's and family's own words in their own section, not under observations", () => {
    const r = buildReport(
      "monthly",
      "Ada",
      input([goal({})], [
        { id: "v1", kind: "observation", record_type: "voice", title: "In their own words", record_date: day(3), fields: { summary: "I like the counters", speaker: "learner" }, created_at: day(3) },
        { id: "v2", kind: "observation", record_type: "voice", title: "In their own words", record_date: day(4), fields: { summary: "Calmer at bedtime", speaker: "family" }, created_at: day(4) },
      ]),
      { now },
    )
    const voice = r.sections.find((s) => s.heading === "In their own words")!.findings.map((f) => f.text)
    expect(voice).toEqual(["Ada: “I like the counters”", "Family: “Calmer at bedtime”"])
    const obs = r.sections.find((s) => s.heading === "Observations")!.findings.map((f) => f.text)
    expect(obs.join(" ")).not.toMatch(/counters|bedtime/)
  })

  it("quarterly review adds baseline, target and review dates", () => {
    const r = buildReport("quarterly", "Ada", input([goal({ baseline: "1 word", target: "3 words", review_date: "2026-08-01" })]), { now })
    expect(r.sections.map((s) => s.heading)).toContain("Baseline, target and review dates")
  })

  it("What changed? compares two dates", () => {
    const g = goal({ progress_logs: withLogs([[1, 5], [2, 5], [70, 2], [75, 2]]) })
    const r = buildReport("changes", "Ada", input([g]), { now, from: day(65), to: day(0) })
    expect(r.sections[0].findings[0].text).toMatch(/30-day average 2\.0 then, 5\.0 now \(higher\)/)
  })
})
