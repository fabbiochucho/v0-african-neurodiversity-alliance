// Support Team roles. The database (scripts/031) is what enforces these;
// this mirror only decides what the UI offers, and the test keeps the two
// descriptions in step.

export const SUPPORT_ROLES = ["caregiver", "teacher", "therapist"] as const
export type SupportRole = (typeof SUPPORT_ROLES)[number]

export const ROLE_PERMISSIONS: Record<SupportRole, { logCheckIns: boolean; viewReports: boolean; changeGoalStatus: boolean }> = {
  caregiver: { logCheckIns: true, viewReports: true, changeGoalStatus: false },
  teacher: { logCheckIns: true, viewReports: false, changeGoalStatus: false },
  therapist: { logCheckIns: true, viewReports: true, changeGoalStatus: true },
}

export const ROLE_DESCRIPTIONS: Record<SupportRole, string> = {
  caregiver: "Sees goals, check-ins and reports; can log check-ins.",
  teacher: "Sees goals and check-ins; can log check-ins.",
  therapist: "Sees goals, check-ins and reports; can log check-ins and mark goals achieved.",
}

export interface SupportTeamMember {
  id: string
  learner_id: string
  learner_name: string
  invited_email: string
  role: SupportRole
  status: "pending" | "active"
  member_user_id: string | null
}

export function isSupportRole(value: unknown): value is SupportRole {
  return typeof value === "string" && (SUPPORT_ROLES as readonly string[]).includes(value)
}

/** Lower-cased, trimmed email if it looks like one; null otherwise. */
export function normaliseInviteEmail(value: unknown): string | null {
  if (typeof value !== "string") return null
  const email = value.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : null
}
