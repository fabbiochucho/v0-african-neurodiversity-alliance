import { afterEach, describe, expect, it } from "vitest"
import { appUrl } from "@/lib/digest"

const original = process.env.NEXT_PUBLIC_APP_URL
afterEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = original
})

describe("appUrl", () => {
  it("uses a valid setting, without a trailing slash", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.org/"
    expect(appUrl()).toBe("https://example.org")
  })
  it("falls back to the real domain when the setting is missing or malformed", () => {
    for (const bad of ["", "anda.becomechange.institute", " ", "ftp://x"]) {
      process.env.NEXT_PUBLIC_APP_URL = bad
      expect(appUrl()).toBe("https://anda.becomechange.institute")
    }
  })
})
