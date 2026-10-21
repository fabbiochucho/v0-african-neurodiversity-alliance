import { describe, expect, it } from "vitest"
import { AFRICA_COUNTRIES } from "@/lib/africa-map"

describe("Africa map data", () => {
  it("has all 54 countries plus Western Sahara, once each", () => {
    const names = AFRICA_COUNTRIES.map((c) => c.name)
    expect(new Set(names).size).toBe(names.length)
    expect(names.length).toBe(55)
  })

  it("uses the directory's country names", () => {
    const names = new Set(AFRICA_COUNTRIES.map((c) => c.name))
    for (const n of ["South Africa", "Nigeria", "Kenya", "Ghana", "Morocco", "Uganda", "Egypt", "Ethiopia", "Tanzania"]) {
      expect(names.has(n), n).toBe(true)
    }
  })

  it("draws every country as a shape or a dot inside the view", () => {
    for (const c of AFRICA_COUNTRIES) {
      expect(c.d || c.small, c.name).toBeTruthy()
      expect(c.cx).toBeGreaterThanOrEqual(0)
      expect(c.cx).toBeLessThanOrEqual(600)
      expect(c.cy).toBeGreaterThanOrEqual(0)
      expect(c.cy).toBeLessThanOrEqual(640)
    }
  })
})
