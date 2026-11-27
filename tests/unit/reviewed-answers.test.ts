import { describe, expect, it } from "vitest"
import { DIAGNOSIS_NOTE, findReviewedAnswers, groundingPrompt, reviewDueDate, reviewLabel } from "@/lib/reviewed-answers"
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

  it("labels answers honestly and always points to a professional assessment", () => {
    expect(reviewLabel({})).toContain("Not yet reviewed by a clinician")
    expect(reviewLabel({ review_level: "clinical" })).toContain("reviewed by a clinician")
    expect(DIAGNOSIS_NOTE).toContain("not a diagnosis")
    expect(groundingPrompt([answer])).toContain("assessment from a qualified professional")
  })

  it("re-checks approved answers a year later", () => {
    expect(reviewDueDate(new Date("2026-11-26T00:00:00Z"))).toBe("2027-11-26")
  })

  it("super admins approve against sources; only clinical reviewers confirm clinically", () => {
    expect(can("super_admin", "answers.approve")).toBe(true)
    expect(can("super_admin", "clinical.approve")).toBe(false)
    expect(can("clinical_reviewer", "answers.approve")).toBe(true)
    expect(can("clinical_reviewer", "clinical.approve")).toBe(true)
    expect(can("clinical_reviewer", "users.read")).toBe(false)
    expect(can("support", "clinical.approve")).toBe(false)
    expect(can("support", "answers.write")).toBe(true)
    expect(can("read_only", "answers.write")).toBe(false)
  })
})

describe("local context", async () => {
  const { resolveCountry, countryName } = await import("@/lib/country")
  const { contextText } = await import("@/lib/reviewed-answers")
  const h = (cc: string | null) => ({ get: (n: string) => (n === "x-vercel-ip-country" ? cc : null) })

  it("uses the person's choice first, then the country header, and only African countries", () => {
    expect(resolveCountry("ke", h("NG"))).toBe("KE")
    expect(resolveCountry(null, h("NG"))).toBe("NG")
    expect(resolveCountry(null, h("US"))).toBeNull()
    expect(resolveCountry("none", h("NG"))).toBeNull()
    expect(resolveCountry("xx", h(null))).toBeNull()
    expect(countryName("ZA")).toBe("South Africa")
  })

  it("puts beliefs to correct before local notes", () => {
    const a = { id: "1", question: "Q", answer: "A", sources: "", lang: "en", context: [
      { answer_id: "1", scope: "africa", kind: "myth" as const, note: "Not a curse.", sources: "" },
      { answer_id: "1", scope: "NG", kind: "local" as const, note: "Call 112.", sources: "" },
    ] }
    expect(contextText(a, "Nigeria")).toBe("What people often hear: Not a curse.\n\nIn Nigeria: Call 112.")
  })
})
