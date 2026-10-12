import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { isSupportRole, normaliseInviteEmail, ROLE_PERMISSIONS, SUPPORT_ROLES } from "@/lib/support-team"
import { tierAllows } from "@/lib/entitlements"

const sql = readFileSync("scripts/031_create_support_team.sql", "utf8")

describe("support team roles", () => {
  it("validates roles", () => {
    expect(SUPPORT_ROLES.every(isSupportRole)).toBe(true)
    expect(isSupportRole("admin")).toBe(false)
    expect(isSupportRole(undefined)).toBe(false)
  })

  it("normalises invite emails and rejects junk", () => {
    expect(normaliseInviteEmail("  Teacher@School.ORG ")).toBe("teacher@school.org")
    expect(normaliseInviteEmail("not-an-email")).toBeNull()
    expect(normaliseInviteEmail("a@b")).toBeNull()
    expect(normaliseInviteEmail(42)).toBeNull()
  })

  it("UI permissions mirror the RLS in scripts/031", () => {
    // reports: caregiver + therapist only
    expect(sql).toMatch(/reports_select_support_team[\s\S]*?array\['caregiver', 'therapist'\]/)
    expect(SUPPORT_ROLES.filter((r) => ROLE_PERMISSIONS[r].viewReports)).toEqual(["caregiver", "therapist"])
    // goal status changes: therapist only
    expect(sql).toMatch(/iep_goals_update_support_therapist[\s\S]*?array\['therapist'\]/)
    expect(SUPPORT_ROLES.filter((r) => ROLE_PERMISSIONS[r].changeGoalStatus)).toEqual(["therapist"])
    // every role can log check-ins
    expect(SUPPORT_ROLES.every((r) => ROLE_PERMISSIONS[r].logCheckIns)).toBe(true)
  })

  it("has no UPDATE policy on support_team_members (accept goes through the definer function)", () => {
    expect(sql).not.toMatch(/on public\.support_team_members for update/)
    expect(sql).toMatch(/create or replace function public\.accept_support_team_invite/)
  })

  it("inviting is a Pro feature", () => {
    expect(tierAllows("premium", "support_team")).toBe(false)
    expect(tierAllows("pro", "support_team")).toBe(true)
  })
})
