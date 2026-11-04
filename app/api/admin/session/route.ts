import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { staffRole } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"
import { ADMIN_COOKIE, adminCookieOptions, signAdminCookie } from "@/lib/admin/session"

export const dynamic = "force-dynamic"

// Starts (or restarts after the idle timeout) an admin session, straight after the person
// entered their 2FA code on /admin/verify. A code entered more than 5 minutes ago doesn't count.
const FRESH_CODE_S = 5 * 60

export async function POST() {
  const who = await staffRole()
  if (!who?.role) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const supabase = await createClient()
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  const totpAt = (data?.currentAuthenticationMethods ?? [])
    .map((m) => (typeof m === "string" ? null : m))
    .filter((m) => m?.method === "totp")
    .reduce((latest, m) => Math.max(latest, m!.timestamp), 0)
  if (data?.currentLevel !== "aal2" || Date.now() / 1000 - totpAt > FRESH_CODE_S) {
    return NextResponse.json({ error: "Enter your 2FA code first." }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, await signAdminCookie(who.userId), adminCookieOptions)
  await logAdminAction(who, "admin.session_start", { type: "staff", id: who.userId })
  return res
}
