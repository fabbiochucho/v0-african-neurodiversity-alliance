// Abuse signals for the review queue (scripts/060, /api/cron/abuse-scan). Pure, so it's tested.
// Not covered: request spikes and sign-in locations (the app doesn't log either; Vercel's
// firewall handles request floods).

// Big free mail providers: many sign-ups from these in a day are normal.
const COMMON_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "outlook.com", "hotmail.com", "live.com",
  "icloud.com", "me.com", "aol.com", "proton.me", "protonmail.com", "ymail.com", "msn.com",
])
export const THRESHOLDS = { signupsPerDomainPerDay: 5, failedPaymentsPerWeek: 3, postsPerDay: 20 }

export interface AbuseFlag {
  kind: "signup_burst_domain" | "repeated_failed_payments" | "post_burst"
  user_id: string | null
  detail: Record<string, unknown>
  dedupe_key: string
}

const countBy = (xs: string[]) => xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>())

export function abuseSignals(input: {
  today: string
  signups: { id: string; email: string | null }[]
  failedPaymentUsers: string[]
  postUsers: string[]
}): AbuseFlag[] {
  const flags: AbuseFlag[] = []
  const domains = countBy(input.signups.map((s) => s.email?.split("@")[1]?.toLowerCase() ?? "").filter((d) => d && !COMMON_DOMAINS.has(d)))
  for (const [domain, n] of domains) {
    if (n >= THRESHOLDS.signupsPerDomainPerDay) {
      flags.push({ kind: "signup_burst_domain", user_id: null, detail: { domain, signups_24h: n }, dedupe_key: `signup:${domain}:${input.today}` })
    }
  }
  for (const [uid, n] of countBy(input.failedPaymentUsers)) {
    if (n >= THRESHOLDS.failedPaymentsPerWeek) {
      flags.push({ kind: "repeated_failed_payments", user_id: uid, detail: { failed_7d: n }, dedupe_key: `payfail:${uid}:${input.today}` })
    }
  }
  for (const [uid, n] of countBy(input.postUsers)) {
    if (n >= THRESHOLDS.postsPerDay) {
      flags.push({ kind: "post_burst", user_id: uid, detail: { posts_24h: n }, dedupe_key: `posts:${uid}:${input.today}` })
    }
  }
  return flags
}
