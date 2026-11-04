// Account actions staff can take from /admin/users. Used by the single-user page and by bulk
// actions; every successful change is written to the audit log. Server-only.
import { createServiceClient } from "@/lib/supabase/service"
import { appUrl, DIGEST_FROM, escapeHtml, getResend } from "@/lib/digest"
import type { Staff } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"

export type ActionResult = { ok: true; message: string } | { ok: false; message: string }

const BANNED = "876000h" // ~100 years; Supabase Auth rejects sign-in and token refresh while banned
export const RESTORE_DAYS = 30
const TAG = /^[a-z0-9][a-z0-9 -]{0,29}$/

async function status(uid: string) {
  const { data } = await createServiceClient()
    .from("account_admin_status")
    .select("suspended_at, suspended_reason, deleted_at, delete_after")
    .eq("user_id", uid)
    .maybeSingle()
  return data
}

async function setStatus(staff: Staff, uid: string, patch: Record<string, unknown>) {
  const { error } = await createServiceClient()
    .from("account_admin_status")
    .upsert({ user_id: uid, ...patch, updated_by: staff.email, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
  if (error) throw error
}

async function revoke(uid: string): Promise<number> {
  const { data } = await createServiceClient().rpc("admin_revoke_sessions", { p_user: uid })
  return typeof data === "number" ? data : 0
}

export async function suspendUser(staff: Staff, uid: string, reason: string, batch?: string): Promise<ActionResult> {
  if (uid === staff.userId) return { ok: false, message: "You can't suspend yourself." }
  const before = await status(uid)
  if (before?.suspended_at) return { ok: true, message: "Already suspended." }
  const { error } = await createServiceClient().auth.admin.updateUserById(uid, { ban_duration: BANNED })
  if (error) return { ok: false, message: error.message }
  await setStatus(staff, uid, { suspended_at: new Date().toISOString(), suspended_reason: reason.slice(0, 500) })
  const sessions = await revoke(uid)
  await logAdminAction(staff, "users.suspend", { type: "user", id: uid, before, after: { reason, sessions_revoked: sessions, batch } })
  return { ok: true, message: "Suspended and signed out everywhere." }
}

export async function unsuspendUser(staff: Staff, uid: string, batch?: string): Promise<ActionResult> {
  const before = await status(uid)
  if (!before?.suspended_at) return { ok: true, message: "Not suspended." }
  if (before.deleted_at) return { ok: false, message: "This account is deleted. Restore it instead." }
  const { error } = await createServiceClient().auth.admin.updateUserById(uid, { ban_duration: "none" })
  if (error) return { ok: false, message: error.message }
  await setStatus(staff, uid, { suspended_at: null, suspended_reason: null })
  await logAdminAction(staff, "users.unsuspend", { type: "user", id: uid, before, after: { suspended_at: null, batch } })
  return { ok: true, message: "Suspension lifted." }
}

export async function revokeSessions(staff: Staff, uid: string): Promise<ActionResult> {
  const n = await revoke(uid)
  await logAdminAction(staff, "users.revoke_sessions", { type: "user", id: uid, after: { sessions_revoked: n } })
  return { ok: true, message: `Signed out of ${n} session${n === 1 ? "" : "s"}.` }
}

export async function verifyEmail(staff: Staff, uid: string): Promise<ActionResult> {
  const db = createServiceClient()
  const { data: before } = await db.auth.admin.getUserById(uid)
  if (before.user?.email_confirmed_at) return { ok: true, message: "Email already confirmed." }
  const { error } = await db.auth.admin.updateUserById(uid, { email_confirm: true })
  if (error) return { ok: false, message: error.message }
  await logAdminAction(staff, "users.verify_email", { type: "user", id: uid, before: { email_confirmed_at: null }, after: { email_confirmed: true } })
  return { ok: true, message: "Email marked as confirmed." }
}

/** Emails the person a link to set a new password, and signs them out everywhere. */
export async function forcePasswordReset(staff: Staff, uid: string): Promise<ActionResult> {
  const db = createServiceClient()
  const resend = getResend()
  if (!resend) return { ok: false, message: "Email isn't set up (RESEND_API_KEY)." }
  const { data: u } = await db.auth.admin.getUserById(uid)
  const email = u.user?.email
  if (!email) return { ok: false, message: "This account has no email." }
  const { data, error } = await db.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${appUrl()}/auth/update-password` },
  })
  const link = data?.properties?.action_link
  if (error || !link) return { ok: false, message: error?.message ?? "Couldn't create the reset link." }
  const { error: sendError } = await resend.emails.send({
    from: DIGEST_FROM,
    to: email,
    subject: "Set a new password for ANDA",
    html: resetHtml(link),
    text: `Our team has asked you to set a new password for your ANDA account.\n\nSet a new password: ${link}\n\nThe link works once. If you didn't expect this, contact anda@becomechange.institute.`,
  })
  if (sendError) return { ok: false, message: `The email didn't send: ${sendError.message}` }
  const sessions = await revoke(uid)
  await logAdminAction(staff, "users.force_password_reset", { type: "user", id: uid, after: { email_sent: true, sessions_revoked: sessions } })
  return { ok: true, message: "Reset email sent, and the account is signed out everywhere." }
}

/** Soft delete: suspended at once, then permanently deleted after RESTORE_DAYS unless restored. */
export async function softDeleteUser(staff: Staff, uid: string, reason: string): Promise<ActionResult> {
  if (uid === staff.userId) return { ok: false, message: "You can't delete your own account here." }
  const before = await status(uid)
  if (before?.deleted_at) return { ok: true, message: "Already scheduled for deletion." }
  const { error } = await createServiceClient().auth.admin.updateUserById(uid, { ban_duration: BANNED })
  if (error) return { ok: false, message: error.message }
  const now = Date.now()
  const deleteAfter = new Date(now + RESTORE_DAYS * 86_400_000).toISOString()
  await setStatus(staff, uid, {
    suspended_at: before?.suspended_at ?? new Date(now).toISOString(),
    deleted_at: new Date(now).toISOString(),
    delete_after: deleteAfter,
    deleted_reason: reason.slice(0, 500),
  })
  await revoke(uid)
  await logAdminAction(staff, "users.soft_delete", { type: "user", id: uid, before, after: { delete_after: deleteAfter, reason } })
  return { ok: true, message: `Scheduled for permanent deletion on ${deleteAfter.slice(0, 10)}. You can restore it until then.` }
}

export async function restoreUser(staff: Staff, uid: string): Promise<ActionResult> {
  const before = await status(uid)
  if (!before?.deleted_at) return { ok: true, message: "Not deleted." }
  const { error } = await createServiceClient().auth.admin.updateUserById(uid, { ban_duration: "none" })
  if (error) return { ok: false, message: error.message }
  await setStatus(staff, uid, { suspended_at: null, suspended_reason: null, deleted_at: null, delete_after: null, deleted_reason: null })
  await logAdminAction(staff, "users.restore", { type: "user", id: uid, before, after: { deleted_at: null } })
  return { ok: true, message: "Account restored and can sign in again." }
}

export async function addTag(staff: Staff, uid: string, rawTag: string, batch?: string): Promise<ActionResult> {
  const tag = rawTag.trim().toLowerCase()
  if (!TAG.test(tag)) return { ok: false, message: "Tags are up to 30 lowercase letters, numbers, spaces or dashes." }
  const { error } = await createServiceClient()
    .from("account_tags")
    .upsert({ user_id: uid, tag, added_by: staff.email }, { onConflict: "user_id,tag", ignoreDuplicates: true })
  if (error) return { ok: false, message: error.message }
  await logAdminAction(staff, "users.tag_add", { type: "user", id: uid, after: { tag, batch } })
  return { ok: true, message: `Tagged "${tag}".` }
}

export async function removeTag(staff: Staff, uid: string, rawTag: string, batch?: string): Promise<ActionResult> {
  const tag = rawTag.trim().toLowerCase()
  const { error } = await createServiceClient().from("account_tags").delete().eq("user_id", uid).eq("tag", tag)
  if (error) return { ok: false, message: error.message }
  await logAdminAction(staff, "users.tag_remove", { type: "user", id: uid, before: { tag }, after: { batch } })
  return { ok: true, message: `Removed "${tag}".` }
}

function resetHtml(link: string): string {
  const url = escapeHtml(link)
  return `<!DOCTYPE html><html lang="en"><body style="margin:0;padding:0;background:#f5f5f4;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1f2937;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="height:6px;line-height:6px;font-size:0;background:#2a7a69;">&nbsp;</td></tr>
<tr><td style="padding:24px 32px 8px 32px;font-size:22px;font-weight:800;color:#2a7a69;">ANDA<span style="display:block;font-size:12px;font-weight:500;color:#6b7280;">African Neurodiversity Alliance</span></td></tr>
<tr><td style="padding:16px 32px 24px 32px;">
<h1 style="margin:0 0 12px 0;font-size:24px;color:#111827;">Set a new password</h1>
<p style="margin:0 0 20px 0;font-size:16px;line-height:1.55;color:#374151;">Our team has asked you to set a new password for your ANDA account. You've been signed out on all your devices.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px;background:#2a7a69;"><a href="${url}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">Set a new password</a></td></tr></table>
<p style="margin:16px 0 0 0;font-size:13px;color:#6b7280;">The link works once. If you didn't expect this, contact anda@becomechange.institute.</p>
</td></tr>
<tr><td style="background:#1f2937;padding:20px 32px;"><p style="margin:0;font-size:12px;color:#9ca3af;">ANDA by DiBadili Institute &middot; P.O. Box 2550, Festac Town, Lagos, Nigeria &middot; <a href="${appUrl()}/privacy" style="color:#e5e7eb;">Privacy</a></p></td></tr>
</table></td></tr></table></body></html>`
}
