import { describe, expect, it } from "vitest"
import { generateEmailHTML, generateReportContent } from "@/lib/reports-service"

describe("generateReportContent", () => {
  const learner = { name: "Amara", age: 8, country: "Ghana", diagnosis_domains: ["ASD", "ADHD"] as ("ASD" | "ADHD")[] }

  it("includes learner details and counts goals per domain", () => {
    const ieps = [
      {
        iep_goals: [
          { domain: "communication", id: "g1" },
          { domain: "communication", id: "g2" },
          { domain: "motor", id: "g3" },
        ],
      },
    ] as any

    const content = generateReportContent(learner, ieps, [], "monthly", "July 2026")

    expect(content).toContain("Amara")
    expect(content).toContain("Ghana")
    expect(content).toContain("ASD, ADHD")
    expect(content).toContain("- communication: 2 goals")
    expect(content).toContain("- motor: 1 goals")
    expect(content).toContain("Total Goals: 3")
  })

  it("handles an IEP with no goals at all", () => {
    const content = generateReportContent(learner, [{ iep_goals: null }] as any, [], "monthly", "July 2026")
    expect(content).toContain("Total Goals: 0")
    expect(content).toContain("Overall Progress: 0.00/5")
  })

  it("averages domain_progress across weekly summaries", () => {
    const summaries = [
      { week_start_date: "2026-07-01", summary_text: "Good week", domain_progress: { communication: 4, motor: 2 } },
      { week_start_date: "2026-07-08", summary_text: "Great week", domain_progress: { communication: 5 } },
    ] as any

    const content = generateReportContent(learner, [], summaries, "monthly", "July 2026")

    // (3 + 5) / 2 = 4.00 average of per-week averages
    expect(content).toContain("Overall Progress: 4.00/5")
    expect(content).toContain("Week of 2026-07-01")
    expect(content).toContain("communication (4/5)")
  })

  it("only includes the first 4 weeks for monthly reports and 13 for quarterly", () => {
    const summaries = Array.from({ length: 20 }, (_, i) => ({
      week_start_date: `week-${i}`,
      summary_text: "",
      domain_progress: {},
    })) as any

    const monthly = generateReportContent(learner, [], summaries, "monthly", "July 2026")
    const quarterly = generateReportContent(learner, [], summaries, "quarterly", "2026 Q3")

    expect(monthly).toContain("week-3")
    expect(monthly).not.toContain("week-4")
    expect(quarterly).toContain("week-12")
    expect(quarterly).not.toContain("week-13")
  })

  it("falls back to 'Not specified' when diagnosis_domains isn't an array", () => {
    const content = generateReportContent(
      { ...learner, diagnosis_domains: undefined as any },
      [],
      [],
      "monthly",
      "July 2026",
    )
    expect(content).toContain("Diagnosis Domains: Not specified")
  })
})

describe("generateEmailHTML", () => {
  it("embeds the report content in the HTML body", () => {
    const html = generateEmailHTML({ content: "Progress: great work this month." })
    expect(html).toContain("Progress: great work this month.")
    expect(html).toContain("ANDA NeuroCare")
  })
})
