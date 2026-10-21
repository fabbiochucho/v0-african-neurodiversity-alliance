import { afterEach, describe, expect, it, vi } from "vitest"
import { buildCsp } from "@/lib/csp"

const connectSrc = () => buildCsp("n").split("; ").find((d) => d.startsWith("connect-src"))!

describe("buildCsp connect-src", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("adds a local Supabase URL (CI signed-in tests)", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321")
    expect(connectSrc()).toContain(" http://127.0.0.1:54321")
  })

  it("never adds a non-local URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://evil.example.com")
    expect(connectSrc()).not.toContain("evil")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://exhgecucrtbzjrpnqtht.supabase.co")
    expect(connectSrc()).not.toContain("exhgecucrtbzjrpnqtht")
  })
})
