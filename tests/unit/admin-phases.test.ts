import { describe, expect, it, vi } from "vitest"

// lib/features and lib/admin/refunds import the service client; these tests use only their pure parts.
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => ({}) }))
vi.mock("@/lib/admin/audit", () => ({ logAdminAction: async () => {} }))

import { bucket, resolveFeature, type FeatureControl, type FeatureTarget } from "@/lib/features"
import { refundAmount } from "@/lib/admin/refunds"
import { abuseSignals } from "@/lib/admin/abuse"
import { maskEmail, maskName, toCsv } from "@/lib/admin/pii"
import { parseBody, slugify, linkParts } from "@/lib/content"

const control = (patch: Partial<FeatureControl> = {}): FeatureControl => ({ key: "ai.companion", enabled: true, killed: false, rollout_percent: 100, ...patch })
const t = (scope: FeatureTarget["scope"], scope_value: string, enabled: boolean): FeatureTarget => ({ scope, scope_value, enabled })

describe("feature switches", () => {
  it("is on with no row, off when killed, whatever the targets say", () => {
    expect(resolveFeature(null, [], {})).toBe(true)
    expect(resolveFeature(control({ killed: true }), [t("user", "u1", true)], { userId: "u1" })).toBe(false)
  })

  it("uses the most specific target: user, then organisation, then plan", () => {
    const targets = [t("plan", "pro", false), t("organization", "o1", true), t("user", "u1", false)]
    expect(resolveFeature(control(), targets, { userId: "u1", organizationId: "o1", plan: "pro" })).toBe(false)
    expect(resolveFeature(control(), targets, { userId: "u2", organizationId: "o1", plan: "pro" })).toBe(true)
    expect(resolveFeature(control(), targets, { userId: "u2", plan: "pro" })).toBe(false)
    expect(resolveFeature(control({ enabled: false }), targets, { userId: "u2", plan: "free" })).toBe(false)
  })

  it("rolls out by a stable bucket", () => {
    const b = bucket("ai.companion", "user-42")
    expect(b).toBe(bucket("ai.companion", "user-42"))
    expect(b).toBeGreaterThanOrEqual(0)
    expect(b).toBeLessThan(100)
    expect(resolveFeature(control({ rollout_percent: b + 1 }), [], { userId: "user-42" })).toBe(true)
    expect(resolveFeature(control({ rollout_percent: b }), [], { userId: "user-42" })).toBe(false)
    expect(resolveFeature(control({ rollout_percent: 50 }), [], {})).toBe(false) // no user, no bucket
  })

  it("spreads users across buckets", () => {
    const inHalf = Array.from({ length: 2000 }, (_, i) => bucket("x", `u${i}`) < 50).filter(Boolean).length
    expect(inHalf).toBeGreaterThan(900)
    expect(inHalf).toBeLessThan(1100)
  })
})

describe("refund amounts", () => {
  it("full when empty, partial up to the payment, rejects the rest", () => {
    expect(refundAmount({ amount: 50 }, "")).toBeNull()
    expect(refundAmount({ amount: 50 }, "20.005")).toBe(20.01)
    expect(refundAmount({ amount: 50 }, "50")).toBe(50)
    expect(refundAmount({ amount: 50 }, "50.01")).toBe("invalid")
    expect(refundAmount({ amount: 50 }, "0")).toBe("invalid")
    expect(refundAmount({ amount: 50 }, "-5")).toBe("invalid")
    expect(refundAmount({ amount: 50 }, "abc")).toBe("invalid")
    expect(refundAmount({ amount: null }, "5")).toBe("invalid")
  })
})

describe("abuse signals", () => {
  it("flags bursts but ignores common mail providers and normal use", () => {
    const signups = [
      ...Array.from({ length: 5 }, (_, i) => ({ id: `a${i}`, email: `x${i}@spam.example` })),
      ...Array.from({ length: 30 }, (_, i) => ({ id: `g${i}`, email: `y${i}@gmail.com` })),
      { id: "b", email: "z@school.example" },
    ]
    const flags = abuseSignals({
      today: "2026-11-04",
      signups,
      failedPaymentUsers: ["u1", "u1", "u1", "u2", "u2"],
      postUsers: [...Array(20).fill("p1"), ...Array(19).fill("p2")],
    })
    expect(flags.map((f) => f.dedupe_key).sort()).toEqual(["payfail:u1:2026-11-04", "posts:p1:2026-11-04", "signup:spam.example:2026-11-04"])
  })
})

describe("PII masking and CSV", () => {
  it("masks emails and names", () => {
    expect(maskEmail("amina.bello@example.org")).toBe("am•••@example.org")
    expect(maskEmail(null)).toBe("")
    expect(maskName("Amina", "Bello")).toBe("A. B.")
  })

  it("quotes cells and neutralises spreadsheet formulas", () => {
    const csv = toCsv(["a", "b"], [{ a: '=HYPERLINK("x")', b: ["vip", "at risk"] }])
    expect(csv).toBe('a,b\r\n"\'=HYPERLINK(""x"")","vip; at risk"')
  })
})

describe("content", () => {
  it("makes web addresses from titles", () => {
    expect(slugify("Ça va? Autism & Schools in Lagos!")).toBe("ca-va-autism-schools-in-lagos")
    expect(slugify("!!!")).toBe("")
  })

  it("parses headings, lists and paragraphs, and only https links", () => {
    const blocks = parseBody("## Events\nJoin us\n\n- One\n- Two\n\nPlain text")
    expect(blocks).toEqual([
      { type: "heading", text: "Events" },
      { type: "paragraph", lines: ["Join us"] },
      { type: "list", items: ["One", "Two"] },
      { type: "paragraph", lines: ["Plain text"] },
    ])
    expect(linkParts("See https://anda.becomechange.institute/blog. Or javascript:alert(1)")).toEqual([
      { text: "See " },
      { text: "https://anda.becomechange.institute/blog", href: "https://anda.becomechange.institute/blog" },
      { text: ". Or javascript:alert(1)" },
    ])
  })
})
