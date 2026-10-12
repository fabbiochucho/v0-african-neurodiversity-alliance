import { describe, expect, it } from "vitest"
import { ALL_NEURODIVERGENT, matchesCondition } from "@/lib/conditions"

describe("matchesCondition", () => {
  it("matches everything when no condition is selected", () => {
    expect(matchesCondition([], "all")).toBe(true)
  })

  it("matches only organisations tagged with the selected condition", () => {
    expect(matchesCondition(["Dyslexia"], "Dyslexia")).toBe(true)
    expect(matchesCondition(["Autism"], "Dyslexia")).toBe(false)
    expect(matchesCondition([], "ADHD")).toBe(false)
  })

  it("includes all-neurodivergent organisations under every condition", () => {
    expect(matchesCondition([ALL_NEURODIVERGENT], "ADHD")).toBe(true)
    expect(matchesCondition([ALL_NEURODIVERGENT], ALL_NEURODIVERGENT)).toBe(true)
  })
})
