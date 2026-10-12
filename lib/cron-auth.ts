import { timingSafeEqual } from "node:crypto"

// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Without the
// secret configured, cron routes refuse every call rather than run open.
export function isCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = new TextEncoder().encode(request.headers.get("authorization") ?? "")
  const expected = new TextEncoder().encode(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}
