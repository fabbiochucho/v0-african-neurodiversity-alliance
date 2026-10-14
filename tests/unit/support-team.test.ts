import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { describePermissions, normaliseInviteEmail, roleLabel } from "@/lib/support-team"
import {
  LEGACY_ROLE_PERMISSIONS,
  MINOR_RESTRICTED,
  PERMISSIONS,
  PRESET_PERMISSIONS,
  validatePermissions,
} from "@/lib/team-permissions"
import { tierAllows } from "@/lib/entitlements"

const sql031 = readFileSync("scripts/031_create_support_team.sql", "utf8")
const sql044 = readFileSync("scripts/044_team_permissions.sql", "utf8")

describe("invite emails", () => {
  it("normalises invite emails and rejects junk", () => {
    expect(normaliseInviteEmail("  Teacher@School.ORG ")).toBe("teacher@school.org")
    expect(normaliseInviteEmail("not-an-email")).toBeNull()
    expect(normaliseInviteEmail("a@b")).toBeNull()
    expect(normaliseInviteEmail(42)).toBeNull()
  })
})

describe("per-member permissions (brief §20)", () => {
  it("the permission list matches the SQL check constraint", () => {
    const listed = sql044.match(/permissions <@ array\[([^\]]+)\]/)![1].match(/'(\w+)'/g)!.map((s) => s.slice(1, -1))
    expect(listed).toEqual([...PERMISSIONS])
  })

  it("legacy roles keep what they had, matching the SQL backfill", () => {
    for (const [role, perms] of Object.entries(LEGACY_ROLE_PERMISSIONS)) {
      const m = sql044.match(new RegExp(`when '${role}' then array\\[([^\\]]+)\\]`))!
      expect(m[1].match(/'(\w+)'/g)!.map((s) => s.slice(1, -1))).toEqual(perms)
    }
  })

  it("presets: teachers can't approve or export; parent/guardian presets have everything", () => {
    expect(PRESET_PERMISSIONS.teacher).not.toContain("approve")
    expect(PRESET_PERMISSIONS.parent).toEqual([...PERMISSIONS])
  })

  it("under-18s: only the owner can grant approve/manage/invite/export (app + DB trigger)", () => {
    expect(validatePermissions(["view", "approve"], { learnerAge: 12, callerIsOwner: false })).toMatchObject({ ok: false })
    expect(validatePermissions(["view", "approve"], { learnerAge: null, callerIsOwner: false })).toMatchObject({ ok: false })
    expect(validatePermissions(["view", "approve"], { learnerAge: 12, callerIsOwner: true })).toEqual({ ok: true, permissions: ["view", "approve"] })
    expect(validatePermissions(["approve"], { learnerAge: 25, callerIsOwner: false })).toEqual({ ok: true, permissions: ["view", "approve"] })
    for (const p of MINOR_RESTRICTED) expect(sql044).toContain(`'${p}'`)
    expect(sql044).toMatch(/learner_age is null or learner_age < 18/)
  })

  it("rejects unknown permissions", () => {
    expect(validatePermissions(["view", "delete_everything"], { learnerAge: 30, callerIsOwner: true }).ok).toBe(false)
  })

  it("RLS goes through has_permission, which still requires the owner's Pro plan", () => {
    expect(sql044).toMatch(/function public\.has_permission[\s\S]*tier_allows\(m\.owner_id, 'pro'\)/)
    expect(sql044).toMatch(/has_permission\(learner_id, 'invite'\)/)
    expect(sql044).toMatch(/has_permission\(ieps\.learner_id, 'log_progress'\)/)
  })

  it("still no UPDATE policy on support_team_members", () => {
    expect(sql031 + sql044).not.toMatch(/on public\.support_team_members for update/)
  })

  it("describes access in plain words", () => {
    expect(describePermissions(["view", "log_progress"])).toBe("Can view the plan and progress and log progress.")
    expect(roleLabel("school_admin")).toBe("School admin")
    expect(roleLabel("caregiver")).toBe("Caregiver")
  })

  it("inviting is a Pro feature", () => {
    expect(tierAllows("premium", "support_team")).toBe(false)
    expect(tierAllows("pro", "support_team")).toBe(true)
  })
})
