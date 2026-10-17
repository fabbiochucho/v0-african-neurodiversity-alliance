import { describe, expect, it } from "vitest"
import { scrubUrl } from "@/components/analytics"

describe("scrubUrl", () => {
  it("drops the query string and hash", () => {
    expect(scrubUrl("https://anda.becomechange.institute/directory?condition=autism#x")).toBe(
      "https://anda.becomechange.institute/directory",
    )
  })
  it("replaces record ids", () => {
    expect(scrubUrl("https://a.example/learners/3f2b1c4d-1111-4abc-9def-0123456789ab/plan")).toBe(
      "https://a.example/learners/[id]/plan",
    )
  })
})
