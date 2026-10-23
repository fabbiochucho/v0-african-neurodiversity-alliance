import { describe, expect, it } from "vitest"
import { ageLabel, servesAgeBracket } from "@/lib/directory"

describe("directory age brackets", () => {
  it("matches overlapping ranges and unknown ages", () => {
    expect(servesAgeBracket(3, 12, "6-12")).toBe(true)
    expect(servesAgeBracket(3, 5, "13-17")).toBe(false)
    expect(servesAgeBracket(16, null, "18+")).toBe(true)
    expect(servesAgeBracket(null, null, "0-2")).toBe(true)
    expect(servesAgeBracket(0, 2, "nope")).toBe(true)
  })

  it("labels ranges, treating 100+ as open-ended", () => {
    expect(ageLabel(null, null)).toBeNull()
    expect(ageLabel(18, 120)).toEqual({ min: 18, max: null })
    expect(ageLabel(3, 12)).toEqual({ min: 3, max: 12 })
  })
})
