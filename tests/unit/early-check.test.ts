import { describe, expect, it } from "vitest"
import { evaluate, QUESTIONS, questionsForAge, type Answer } from "@/lib/early-check"

// Every question answered the reassuring way, at a given age.
const allFine = (months: number) =>
  Object.fromEntries(questionsForAge(months).map((q) => [q.id, (q.concernWhen === "yes" ? "no" : "yes") as Answer]))

describe("early development check", () => {
  it("asks age-appropriate questions only", () => {
    expect(questionsForAge(12).map((q) => q.id)).not.toContain("words")
    expect(questionsForAge(16).map((q) => q.id)).toContain("words")
    expect(questionsForAge(24).map((q) => q.id)).toContain("phrases")
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length)
  })

  it("reassures when nothing is worrying", () => {
    expect(evaluate(24, allFine(24)).level).toBe("watch")
  })

  it("always says 'soon' when skills are lost", () => {
    const r = evaluate(20, { ...allFine(20), lost_skills: "yes" })
    expect(r.level).toBe("soon")
    expect(r.reasons[0]).toContain("lost words or skills")
  })

  it("flags no words at 16 months, but not at 14", () => {
    expect(evaluate(16, { ...allFine(16), words: "no" }).level).toBe("soon")
    expect(evaluate(14, { ...allFine(14), words: "no" }).level).toBe("watch")
  })

  it("flags no response to name together with no pointing or showing", () => {
    expect(evaluate(18, { ...allFine(18), name: "no", point_share: "no" }).level).toBe("soon")
    expect(evaluate(18, { ...allFine(18), name: "no" }).hearingCheck).toBe(true)
  })

  it("suggests a check at 3 concerns, counting 'sometimes' as half", () => {
    expect(evaluate(24, { ...allFine(24), pretend: "no", copy: "no", sounds: "yes" }).level).toBe("check")
    expect(evaluate(24, { ...allFine(24), pretend: "no", copy: "no", sounds: "sometimes" }).level).toBe("watch")
    expect(evaluate(24, { ...allFine(24), pretend: "no", copy: "no", sounds: "sometimes", smile_back: "sometimes" }).level).toBe("check")
  })

  it("lists unanswered and 'not sure' questions so the carer can ask someone else", () => {
    const r = evaluate(18, { ...allFine(18), pretend: "unsure", walks: undefined })
    expect(r.unsure).toEqual(expect.arrayContaining(["Pretend play", "Walking"]))
  })

  it("suggests a health check when a child isn't walking at 18 months", () => {
    const r = evaluate(18, { ...allFine(18), walks: "no" })
    expect(r.motorCheck).toBe(true)
    expect(r.level).toBe("check")
  })
})
