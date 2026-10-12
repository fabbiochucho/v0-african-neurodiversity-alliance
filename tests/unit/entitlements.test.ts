import { describe, expect, it, vi } from "vitest"
import {
  effectiveTier,
  getEntitlement,
  LEARNER_LIMITS,
  nextTier,
  tierAllows,
  tierFeatures,
  type SubscriptionRow,
} from "@/lib/entitlements"
import { SUBSCRIPTION_TIERS } from "@/lib/constants/iep"

const NOW = new Date("2026-06-01T00:00:00Z")
const FUTURE = "2026-07-01T00:00:00Z"
const PAST = "2026-05-01T00:00:00Z"
const paid = [{ status: "successful" }]

const row = (overrides: Partial<SubscriptionRow>): SubscriptionRow => ({
  tier: "pro",
  status: "active",
  renewal_date: FUTURE,
  payment_transactions: paid,
  ...overrides,
})

describe("effectiveTier", () => {
  it("is free with no subscriptions", () => {
    expect(effectiveTier([], NOW)).toBe("free")
    expect(effectiveTier(null, NOW)).toBe("free")
  })

  it("honours an active, paid, unexpired subscription", () => {
    expect(effectiveTier([row({})], NOW)).toBe("pro")
  })

  it("treats expired, cancelled, pending and inactive as free", () => {
    expect(effectiveTier([row({ renewal_date: PAST })], NOW)).toBe("free")
    expect(effectiveTier([row({ renewal_date: null })], NOW)).toBe("free")
    expect(effectiveTier([row({ status: "cancelled" })], NOW)).toBe("free")
    expect(effectiveTier([row({ status: "pending" })], NOW)).toBe("free")
    expect(effectiveTier([row({ status: "inactive" })], NOW)).toBe("free")
  })

  it("ignores a row with no successful payment (self-inserted row)", () => {
    expect(effectiveTier([row({ payment_transactions: [] })], NOW)).toBe("free")
    expect(effectiveTier([row({ payment_transactions: [{ status: "pending" }] })], NOW)).toBe("free")
    expect(effectiveTier([row({ payment_transactions: undefined })], NOW)).toBe("free")
  })

  it("ignores unknown tier strings", () => {
    expect(effectiveTier([row({ tier: "platinum" })], NOW)).toBe("free")
  })

  it("picks the highest valid tier when several rows exist", () => {
    expect(
      effectiveTier([row({ tier: "premium" }), row({ tier: "institutional" }), row({ tier: "pro" })], NOW),
    ).toBe("institutional")
    expect(effectiveTier([row({ tier: "premium" }), row({ tier: "institutional", renewal_date: PAST })], NOW)).toBe(
      "premium",
    )
  })
})

describe("tierAllows / nextTier", () => {
  it("gates reports at premium and email at pro", () => {
    expect(tierAllows("free", "reports")).toBe(false)
    expect(tierAllows("premium", "reports")).toBe(true)
    expect(tierAllows("premium", "email_reports")).toBe(false)
    expect(tierAllows("pro", "email_reports")).toBe(true)
    expect(tierAllows("institutional", "email_reports")).toBe(true)
  })

  it("returns the next tier up", () => {
    expect(nextTier("free")).toBe("premium")
    expect(nextTier("pro")).toBe("institutional")
    expect(nextTier("institutional")).toBe("institutional")
  })
})

describe("advertised features match gates", () => {
  it("SUBSCRIPTION_TIERS features are exactly what tierFeatures derives", () => {
    for (const tier of ["free", "premium", "pro", "institutional"] as const) {
      expect(SUBSCRIPTION_TIERS[tier].features).toEqual(tierFeatures(tier))
      expect(tierFeatures(tier)[0]).toContain(String(LEARNER_LIMITS[tier]))
    }
    expect(tierFeatures("free").join(" ")).not.toMatch(/report/i)
    expect(tierFeatures("premium").join(" ")).not.toMatch(/email/i)
  })
})

describe("getEntitlement", () => {
  function mockClient(result: { data: unknown; error: unknown }) {
    const query = { select: vi.fn(), eq: vi.fn() }
    query.select.mockReturnValue(query)
    query.eq.mockReturnValueOnce(query).mockReturnValueOnce(Promise.resolve(result))
    // RPC missing (032 not applied yet) -> falls back to the TS rule.
    const rpc = vi.fn(async () => ({ data: null, error: { message: "function public.entitled_tier does not exist" } }))
    return { from: vi.fn(() => query), query, rpc }
  }

  it("resolves the tier from the user's active subscriptions", async () => {
    const client = mockClient({ data: [row({ tier: "premium", renewal_date: "2999-01-01T00:00:00Z" })], error: null })
    const ent = await getEntitlement(client as never, "user-1")
    expect(client.from).toHaveBeenCalledWith("subscriptions")
    expect(client.query.eq).toHaveBeenCalledWith("user_id", "user-1")
    expect(ent.tier).toBe("premium")
    expect(ent.learnerLimit).toBe(LEARNER_LIMITS.premium)
    expect(ent.can("reports")).toBe(true)
    expect(ent.can("email_reports")).toBe(false)
  })

  it("uses the database's entitled_tier() when it is available", async () => {
    const client = { rpc: vi.fn(async () => ({ data: "institutional", error: null })), from: vi.fn() }
    const ent = await getEntitlement(client as never, "user-1")
    expect(client.rpc).toHaveBeenCalledWith("entitled_tier", { p_user: "user-1" })
    expect(client.from).not.toHaveBeenCalled()
    expect(ent.tier).toBe("institutional")
    expect(ent.learnerLimit).toBe(50)
  })

  it("fails closed to free on a query error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const client = mockClient({ data: [row({ renewal_date: "2999-01-01T00:00:00Z" })], error: { message: "boom" } })
    const ent = await getEntitlement(client as never, "user-1")
    expect(ent.tier).toBe("free")
    expect(ent.can("reports")).toBe(false)
  })
})
