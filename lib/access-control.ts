// Role-Based Access Control (RBAC) System

import type { UserRole } from "./types/iep"

export type Permission = "view" | "edit" | "report" | "approve" | "export" | "admin"

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  parent: ["view", "edit", "report", "export"],
  teacher: ["view", "edit", "report"],
  therapist: ["view", "edit", "report"],
  clinician: ["view", "edit", "report", "approve"],
  admin: ["view", "edit", "report", "approve", "export", "admin"],
  student: ["view"],
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  parent: "Primary account holder - can manage profiles and invite other users",
  teacher: "Educational professional - can view and log progress in educational domains",
  therapist: "Therapeutic professional - can view and log progress in therapy domains",
  clinician: "Healthcare professional - can view, approve goals, and provide clinical recommendations",
  admin: "System administrator - full access to all features and user management",
  student: "Self-report access - can view their own profile and log progress (age-appropriate)",
}

export class AccessControl {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false
  }

  /**
   * Check if a user can perform an action on a profile
   */
  static canAccessProfile(userRole: UserRole, isProfileOwner: boolean): boolean {
    if (userRole === "admin") return true
    if (userRole === "parent" && isProfileOwner) return true
    if (["teacher", "therapist", "clinician"].includes(userRole)) return true
    if (userRole === "student" && isProfileOwner) return true
    return false
  }

  /**
   * Check if a user can edit an IEP
   */
  static canEditIEP(userRole: UserRole, isCreator: boolean): boolean {
    if (userRole === "admin") return true
    if (userRole === "parent" && isCreator) return true
    if (userRole === "clinician") return true
    return false
  }

  /**
   * Check if a user can approve goals
   */
  static canApproveGoals(userRole: UserRole): boolean {
    return ["clinician", "admin"].includes(userRole)
  }

  /**
   * Check if a user can export reports
   */
  static canExportReports(userRole: UserRole): boolean {
    return ["parent", "clinician", "admin"].includes(userRole)
  }

  /**
   * Get available roles for invitation based on current user role
   */
  static getInvitableRoles(userRole: UserRole): UserRole[] {
    if (userRole === "parent") {
      return ["teacher", "therapist", "clinician"]
    }
    if (userRole === "admin") {
      return ["parent", "teacher", "therapist", "clinician", "admin"]
    }
    return []
  }

  /**
   * Check if user can manage organization
   */
  static canManageOrganization(userRole: UserRole): boolean {
    return ["admin"].includes(userRole)
  }
}

export interface InvitationRequest {
  invitation_id: string
  from_user_id: string
  to_email: string
  role: UserRole
  profile_id?: string
  organization_id?: string
  status: "pending" | "accepted" | "declined"
  created_at: Date
  expires_at: Date
}
