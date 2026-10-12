// Server-only helpers for emailed support-team invites (scripts/034).
import { createHash, randomBytes } from "node:crypto"
import { Resend } from "resend"

export const INVITE_TTL_DAYS = 7

export function newInviteToken(now: Date = new Date()) {
  const token = randomBytes(32).toString("base64url")
  return {
    token,
    hash: hashInviteToken(token),
    expiresAt: new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export function inviteLink(appUrl: string, inviteId: string, token: string): string {
  const url = new URL("/team/accept", appUrl)
  url.searchParams.set("invite", inviteId)
  url.searchParams.set("token", token)
  return url.toString()
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

export function inviteEmail({ learnerName, role, inviterName, link }: { learnerName: string; role: string; inviterName: string; link: string }) {
  const subject = `You're invited to ${learnerName}'s support team on ANDA`
  const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#2b2420;max-width:560px;margin:0 auto;padding:20px">
<h1 style="font-size:20px">Join ${escapeHtml(learnerName)}'s support team</h1>
<p>${escapeHtml(inviterName)} has invited you to join ${escapeHtml(learnerName)}'s support team on ANDA (African Neurodiversity Alliance) as a <strong>${escapeHtml(role)}</strong>.</p>
<p>You'll be able to follow their goals and log check-ins.</p>
<p><a href="${escapeHtml(link)}" style="display:inline-block;background:#2a7a69;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Accept the invitation</a></p>
<p style="font-size:13px;color:#6b5f57">Sign in (or create an account) with this email address to accept. The link expires in ${INVITE_TTL_DAYS} days. If you weren't expecting this, you can ignore it.</p>
</body></html>`
  return { subject, html }
}

export function canSendEmail(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

/** Sends via the existing Resend setup. Returns false (never throws) on failure or when unconfigured. */
export async function sendInviteEmail(to: string, email: { subject: string; html: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ANDA <noreply@anda.becomechange.institute>",
      to,
      subject: email.subject,
      html: email.html,
    })
    if (error) console.error("invite email error:", error.name)
    return !error
  } catch {
    console.error("invite email error")
    return false
  }
}
