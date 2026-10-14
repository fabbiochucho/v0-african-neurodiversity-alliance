// Support Team members. Access is per-member permissions (lib/team-permissions.ts,
// enforced by public.has_permission() in scripts/044); the role is a preset label.
import { PERMISSION_LABELS, PRESET_LABELS, isPreset, type Permission } from "@/lib/team-permissions"

export interface SupportTeamMember {
  id: string
  learner_id: string
  learner_name: string
  invited_email: string
  role: string
  permissions?: Permission[] | null
  status: "pending" | "active"
  member_user_id: string | null
  invite_expires_at?: string | null
}

const LEGACY_LABELS: Record<string, string> = { caregiver: "Caregiver", teacher: "Teacher", therapist: "Therapist" }

export function roleLabel(role: string): string {
  return isPreset(role) ? PRESET_LABELS[role] : (LEGACY_LABELS[role] ?? role)
}

/** "Can view the plan and progress, log progress and comment." */
export function describePermissions(perms: Permission[] | null | undefined): string {
  const list = (perms ?? []).map((p) => PERMISSION_LABELS[p].toLowerCase())
  if (list.length === 0) return "No access yet."
  const last = list.pop()
  return `Can ${list.length > 0 ? `${list.join(", ")} and ${last}` : last}.`
}

/** Lower-cased, trimmed email if it looks like one; null otherwise. */
export function normaliseInviteEmail(value: unknown): string | null {
  if (typeof value !== "string") return null
  const email = value.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : null
}
