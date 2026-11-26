import { describe, expect, it } from "vitest"
import { findReviewedAnswers, groundingPrompt, reviewDueDate } from "@/lib/reviewed-answers"
import { can } from "@/lib/admin/permissions"

const answer = { id: "a1", question: "How can we make bedtime calmer?", answer: "Keep the same short routine every night.", sources: "Sleep guide", lang: "en" }

describe("reviewed answers", () => {
  it("tells the model to stay inside the reviewed answers and name them", () => {
    const p = groundingPrompt([answer])
    expect(p).toContain("[1] How can we make bedtime calmer?")
    expect(p).toContain("Sources: Sleep guide")
    expect(p).toContain("Don't add facts")
  })

  it("sends uncovered questions to an expert instead of guessing", () => {
    expect(groundingPrompt([])).toContain("No ANDA reviewed answer covers this question")
    expect(groundingPrompt([])).toContain("/ask")
  })

  it("returns nothing on a search error or an empty question", async () => {
    const failing = { rpc: async () => ({ data: null, error: { message: "x" } }) }
    expect(await findReviewedAnswers(failing, "bedtime")).toEqual([])
    expect(await findReviewedAnswers(failing, "   ")).toEqual([])
  })

  it("re-checks approved answers a year later", () => {
    expect(reviewDueDate(new Date("2026-11-26T00:00:00Z"))).toBe("2027-11-26")
  })

  it("super admins and clinical reviewers approve; support can write", () => {
    expect(can("super_admin", "clinical.approve")).toBe(true)
    expect(can("clinical_reviewer", "clinical.approve")).toBe(true)
    expect(can("clinical_reviewer", "users.read")).toBe(false)
    expect(can("support", "clinical.approve")).toBe(false)
    expect(can("support", "answers.write")).toBe(true)
    expect(can("read_only", "answers.write")).toBe(false)
  })
})
