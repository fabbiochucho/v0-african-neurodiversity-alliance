import { describe, expect, it } from "vitest"
import { PERMISSIONS, ROLE_PERMISSIONS, STAFF_ROLES, can } from "@/lib/admin/permissions"
import { IDLE_MS, adminCookieFresh, signAdminCookie } from "@/lib/admin/session"

describe("admin permissions", () => {
  it("gives super admins everything and nobody else staff management", () => {
    for (const p of PERMISSIONS) expect(can("super_admin", p)).toBe(true)
    for (const r of STAFF_ROLES.filter((r) => r !== "super_admin")) expect(can(r, "staff.manage")).toBe(false)
  })

  it("keeps read-only staff from changing anything", () => {
    expect(ROLE_PERMISSIONS.read_only.every((p) => p.endsWith(".read"))).toBe(true)
  })

  it("separates finance, support and engineering", () => {
    expect(can("finance", "billing.refund")).toBe(true)
    expect(can("support", "billing.refund")).toBe(false)
    expect(can("support", "users.suspend")).toBe(true)
    expect(can("finance", "users.suspend")).toBe(false)
    expect(can("engineering", "features.edit")).toBe(true)
    expect(can("engineering", "newsletter.send")).toBe(false)
  })

  it("denies when there's no role", () => {
    expect(can(null, "dashboard.read")).toBe(false)
    expect(can(undefined, "dashboard.read")).toBe(false)
  })

  it("only lists real permissions", () => {
    for (const r of STAFF_ROLES) for (const p of ROLE_PERMISSIONS[r]) expect(PERMISSIONS).toContain(p)
  })
})

describe("admin idle timer cookie", () => {
  const key = "test-key"
  const now = 1_800_000_000_000

  it("is fresh for the same user within 30 minutes", async () => {
    const c = await signAdminCookie("user-1", now, key)
    expect(await adminCookieFresh(c, "user-1", now + IDLE_MS - 1000, key)).toBe(true)
  })

  it("expires after 30 minutes idle", async () => {
    const c = await signAdminCookie("user-1", now, key)
    expect(await adminCookieFresh(c, "user-1", now + IDLE_MS + 1000, key)).toBe(false)
  })

  it("rejects another user, a forged time and a missing cookie", async () => {
    const c = await signAdminCookie("user-1", now, key)
    expect(await adminCookieFresh(c, "user-2", now, key)).toBe(false)
    const [id, , sig] = c.split(".")
    expect(await adminCookieFresh(`${id}.${now + 60_000}.${sig}`, "user-1", now + 60_000, key)).toBe(false)
    expect(await adminCookieFresh(undefined, "user-1", now, key)).toBe(false)
  })
})
