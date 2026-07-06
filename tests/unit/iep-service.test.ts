import { describe, expect, it } from "vitest"
import { IEPService } from "@/lib/iep-service"

describe("IEPService.generateAdaptiveGoals", () => {
  it("returns adaptive goals for a supported diagnosis domain", () => {
    const goals = IEPService.generateAdaptiveGoals({ diagnosis_domains: ["ASD"] })

    expect(goals.length).toBeGreaterThan(0)
    expect(goals.every((g) => typeof g.goal_description === "string" && g.goal_description.length > 0)).toBe(true)
    expect(goals.every((g) => g.timeline === "3 months")).toBe(true)
  })

  it("combines goals across multiple diagnosis domains", () => {
    const asdOnly = IEPService.generateAdaptiveGoals({ diagnosis_domains: ["ASD"] })
    const combined = IEPService.generateAdaptiveGoals({ diagnosis_domains: ["ASD", "ADHD"] })

    expect(combined.length).toBeGreaterThan(asdOnly.length)
  })

  it("returns an empty array when there are no diagnosis domains", () => {
    expect(IEPService.generateAdaptiveGoals({ diagnosis_domains: [] })).toEqual([])
  })

  it("does not throw for a domain with no goal templates", () => {
    expect(() =>
      // @ts-expect-error - intentionally passing an unsupported domain
      IEPService.generateAdaptiveGoals({ diagnosis_domains: ["Unsupported"] }),
    ).not.toThrow()
  })
})

describe("IEPService.calculateProgressSummary", () => {
  it("averages ratings per goal id", () => {
    const summary = IEPService.calculateProgressSummary([
      { goal_id: "g1", rating: 3 },
      { goal_id: "g1", rating: 5 },
      { goal_id: "g2", rating: 4 },
    ])

    expect(summary.g1).toBe(4)
    expect(summary.g2).toBe(4)
  })

  it("returns an empty object for no logs", () => {
    expect(IEPService.calculateProgressSummary([])).toEqual({})
  })
})

describe("IEPService.generateIEPSummary", () => {
  it("mentions the learner's name, age, and goal domains", () => {
    const summary = IEPService.generateIEPSummary(
      { name: "Amara", age: 8 },
      [
        {
          domain: "communication",
          goal_description: "Improve turn-taking in conversation",
          target_metric: "3 successful exchanges per session",
          timeline: "3 months",
        },
      ],
    )

    expect(summary).toContain("Amara")
    expect(summary).toContain("8")
    expect(summary).toContain("communication")
  })
})
