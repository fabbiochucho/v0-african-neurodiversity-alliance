import { describe, expect, it } from "vitest"
import { ADULT_QUESTIONS, AREAS, evaluateAdult, type Freq } from "@/lib/adult-check"

const all = (f: Freq) => Object.fromEntries(ADULT_QUESTIONS.map((q) => [q.id, f]))

describe("adult self-check", () => {
  it("has unique questions and every area has at least one", () => {
    expect(new Set(ADULT_QUESTIONS.map((q) => q.id)).size).toBe(ADULT_QUESTIONS.length)
    for (const area of Object.keys(AREAS)) expect(ADULT_QUESTIONS.some((q) => q.area === area)).toBe(true)
  })

  it("flags nothing when everything is rare", () => {
    const r = evaluateAdult(all("rarely"))
    expect(r.explore).toEqual([])
    expect(r.wellbeing).toBe(false)
  })

  it("flags an area when at least half its questions are often or very often", () => {
    const r = evaluateAdult({ ...all("never"), d_attention: "often", d_losing: "very_often", d_finishing: "often" })
    expect(r.explore).toEqual(["adhd"])
    expect(r.counts.adhd).toEqual({ present: 3, asked: 6 })
  })

  it("doesn't count 'sometimes'", () => {
    expect(evaluateAdult({ ...all("never"), d_attention: "sometimes", d_losing: "sometimes", d_finishing: "sometimes" }).explore).toEqual([])
  })

  it("signposts low mood from a single question", () => {
    const r = evaluateAdult({ ...all("never"), w_low: "often" })
    expect(r.wellbeing).toBe(true)
    expect(r.explore).toEqual(["wellbeing"])
  })

  it("flags tics from its single question", () => {
    expect(evaluateAdult({ ...all("never"), t_tics: "very_often" }).explore).toEqual(["tics"])
  })
})
