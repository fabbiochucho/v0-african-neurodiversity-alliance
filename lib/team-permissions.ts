// Per-member team permissions (brief §20). The database enforces these
// through public.has_permission() (scripts/044); this module only decides
// what the UI offers, and the tests keep it in step with the SQL.

export const PERMISSIONS = [
  "view",
  "comment",
  "add_observation",
  "log_progress",
  "suggest_goal",
  "approve",
  "manage_plan",
  "invite",
  "export",
  "generate_report",
] as const
export type Permission = (typeof PERMISSIONS)[number]

export const PERMISSION_LABELS: Record<Permission, string> = {
  view: "View the plan and progress",
  comment: "Comment",
  add_observation: "Add observations",
  log_progress: "Log progress",
  suggest_goal: "Suggest goals",
  approve: "Approve the plan",
  manage_plan: "Manage the plan",
  invite: "Invite others",
  export: "Export data",
  generate_report: "See and generate reports",
}

/** Only the parent/guardian (the learner's owner) may grant these for under-18s. */
export const MINOR_RESTRICTED: Permission[] = ["approve", "manage_plan", "invite", "export"]

export const PRESETS = [
  "parent",
  "guardian",
  "teacher",
  "school_admin",
  "therapist",
  "clinician",
  "specialist",
  "other_professional",
] as const
export type Preset = (typeof PRESETS)[number]

export const PRESET_LABELS: Record<Preset, string> = {
  parent: "Parent",
  guardian: "Guardian",
  teacher: "Teacher",
  school_admin: "School admin",
  therapist: "Therapist",
  clinician: "Clinician",
  specialist: "Specialist",
  other_professional: "Other professional",
}

const CORE: Permission[] = ["view", "comment", "add_observation", "log_progress", "suggest_goal"]

export const PRESET_PERMISSIONS: Record<Preset, Permission[]> = {
  parent: [...PERMISSIONS],
  guardian: [...PERMISSIONS],
  teacher: CORE,
  school_admin: [...CORE, "generate_report"],
  therapist: [...CORE, "generate_report"],
  clinician: [...CORE, "generate_report"],
  specialist: [...CORE, "generate_report"],
  other_professional: ["view", "comment"],
}

/** Legacy F.7 roles keep what they had (mirrors the backfill in scripts/044). */
export const LEGACY_ROLE_PERMISSIONS: Record<"caregiver" | "teacher" | "therapist", Permission[]> = {
  caregiver: ["view", "comment", "add_observation", "log_progress", "generate_report"],
  teacher: ["view", "comment", "add_observation", "log_progress"],
  therapist: ["view", "comment", "add_observation", "log_progress", "generate_report", "manage_plan"],
}

export function isPreset(v: unknown): v is Preset {
  return typeof v === "string" && (PRESETS as readonly string[]).includes(v)
}

export function isMinor(age: number | null | undefined): boolean {
  return age == null || age < 18
}

/**
 * Validates a requested permission list. For minors, non-owners can't
 * grant the restricted ones (the DB trigger enforces the same rule).
 */
export function validatePermissions(
  raw: unknown,
  { learnerAge, callerIsOwner }: { learnerAge: number | null | undefined; callerIsOwner: boolean },
): { ok: true; permissions: Permission[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) return { ok: false, error: "Choose at least one permission." }
  const perms = Array.from(new Set(raw.filter((p): p is Permission => (PERMISSIONS as readonly string[]).includes(p as string))))
  if (perms.length !== raw.length || perms.length === 0) return { ok: false, error: "Unknown permission." }
  if (!perms.includes("view")) perms.unshift("view")
  if (isMinor(learnerAge) && !callerIsOwner && perms.some((p) => MINOR_RESTRICTED.includes(p))) {
    return { ok: false, error: "For learners under 18, only their parent or guardian can grant approve, manage plan, invite or export." }
  }
  return { ok: true, permissions: perms }
}
