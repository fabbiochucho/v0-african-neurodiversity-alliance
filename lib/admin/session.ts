// Idle timeout for the admin panel. After 2FA, /api/admin/session sets a signed cookie holding
// the user id and the time of the last admin request; each admin page view renews it while it's
// fresh. After IDLE_MS without activity the panel asks for the 2FA code again.
// Web Crypto only, so middleware (edge) and server code can both use it.

export const ADMIN_COOKIE = "anda_admin_active"
export const IDLE_MS = 30 * 60 * 1000

const enc = new TextEncoder()

function secret(): string {
  const s = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
  return s
}

async function hmac(data: string, key: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(`admin-idle:${data}`)))
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("")
}

export async function signAdminCookie(userId: string, now = Date.now(), key = secret()): Promise<string> {
  const data = `${userId}.${now}`
  return `${data}.${await hmac(data, key)}`
}

/** True when the cookie is ours, for this user, and less than IDLE_MS old. */
export async function adminCookieFresh(
  value: string | undefined,
  userId: string,
  now = Date.now(),
  key = secret(),
): Promise<boolean> {
  const [id, ts, sig] = (value ?? "").split(".")
  if (!id || !ts || !sig || id !== userId) return false
  const age = now - Number(ts)
  if (!Number.isFinite(age) || age < 0 || age > IDLE_MS) return false
  const expected = await hmac(`${id}.${ts}`, key)
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  return diff === 0
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: IDLE_MS / 1000,
}
