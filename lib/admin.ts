import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { can, isStaffRole, type Permission, type StaffRole } from "@/lib/admin/permissions"
import { ADMIN_COOKIE, adminCookieFresh, adminCookieOptions, signAdminCookie } from "@/lib/admin/session"

export interface Staff {
  userId: string
  email: string
  role: StaffRole
}

type Gate = { ok: true; staff: Staff } | { ok: false; reason: "signed_out" | "not_staff" | "forbidden" | "mfa" | "idle" }

/** People in ADMIN_EMAILS (comma-separated) are super admins, so the owners can't be locked out. */
export function ownerEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/** The signed-in user's staff role, before any 2FA or idle check. */
export async function staffRole(): Promise<{ userId: string; email: string; role: StaffRole | null } | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return null
  const email = user.email.toLowerCase()
  if (ownerEmails().includes(email)) return { userId: user.id, email, role: "super_admin" }
  const { data } = await createServiceClient().from("staff_members").select("role").eq("user_id", user.id).maybeSingle()
  return { userId: user.id, email, role: isStaffRole(data?.role) ? data.role : null }
}

/**
 * Every admin page, action and API route goes through here: signed in, on the staff list,
 * allowed this permission, signed in with 2FA, and active in the last 30 minutes.
 */
export async function checkStaff(permission: Permission): Promise<Gate> {
  const who = await staffRole()
  if (!who) return { ok: false, reason: "signed_out" }
  if (!who.role) return { ok: false, reason: "not_staff" }
  if (!can(who.role, permission)) return { ok: false, reason: "forbidden" }

  const supabase = await createClient()
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal?.currentLevel !== "aal2") return { ok: false, reason: "mfa" }

  const jar = await cookies()
  if (!(await adminCookieFresh(jar.get(ADMIN_COOKIE)?.value, who.userId))) return { ok: false, reason: "idle" }
  try {
    // Renews the idle timer. Allowed in route handlers and server actions; pages renew it in middleware.
    jar.set(ADMIN_COOKIE, await signAdminCookie(who.userId), adminCookieOptions)
  } catch {}
  return { ok: true, staff: { userId: who.userId, email: who.email, role: who.role } }
}

/** For admin pages: sends people to sign in or to 2FA, and hides the page from everyone else. */
export async function requireStaff(permission: Permission): Promise<Staff> {
  const gate = await checkStaff(permission)
  if (gate.ok) return gate.staff
  if (gate.reason === "signed_out") redirect("/auth/login?redirect=/admin")
  if (gate.reason === "mfa" || gate.reason === "idle") redirect("/admin/verify")
  notFound()
}

/** For admin API routes: the staff member, or the error response to return. */
export async function staffForApi(permission: Permission): Promise<Staff | NextResponse> {
  const gate = await checkStaff(permission)
  if (gate.ok) return gate.staff
  if (gate.reason === "mfa" || gate.reason === "idle") {
    return NextResponse.json({ error: "Your admin session timed out. Reload the page to enter your 2FA code." }, { status: 401 })
  }
  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

/** For server actions: the staff member, or null (the action then does nothing). */
export async function staffForAction(permission: Permission): Promise<Staff | null> {
  const gate = await checkStaff(permission)
  return gate.ok ? gate.staff : null
}

/** Which of these permissions the current staff member has, for showing only the links they can use. */
export function allowed(staff: Staff, permissions: Permission[]): Set<Permission> {
  return new Set(permissions.filter((p) => can(staff.role, p)))
}
