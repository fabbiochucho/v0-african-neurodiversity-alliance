// Single source of truth for what each IEP Tracker tier unlocks.
//
// Everything that gates a feature (API routes, server components) and
// everything that advertises a tier (pricing cards, subscription settings)
// reads from this file, so what we sell and what we enforce can't drift.

import type { SupabaseClient } from "@supabase/supabase-js"
import type { SubscriptionTier } from "@/lib/types/iep"

export const TIER_RANK: Record<SubscriptionTier, number> = { free: 0, premium: 1, pro: 2, institutional: 3 }

/** How many learner profiles (people being supported) each tier may hold. */
export const LEARNER_LIMITS: Record<SubscriptionTier, number> = { free: 1, premium: 3, pro: 10, institutional: 50 }

/** How long one successful payment keeps a tier active. */
export const SUBSCRIPTION_PERIOD_DAYS: Record<SubscriptionTier, number> = {
  free: 0,
  premium: 30,
  pro: 30,
  institutional: 365,
}

export type Feature =
  | "ai_companion"
  | "screening"
  | "screening_in_depth"
  | "reports"
  | "email_reports"
  | "support_team"
  | "team_dashboard"
  | "branding"
  | "bulk_enrollment"
  | "csv_export"
  | "data_export"

// Restored round 2 under the tiers they were originally advertised for:
// Free "basic screening", Premium "full screening", Pro "multi-user
// dashboard" + "branded reports", Institutional "bulk enrollment" +
// "data export". Each is enforced server-side and (where it inserts data)
// in SQL -- see tests/unit/entitlements-sql.test.ts.
export const FEATURE_MIN_TIER: Record<Feature, SubscriptionTier> = {
  screening: "free",
  screening_in_depth: "premium",
  reports: "premium",
  email_reports: "pro",
  support_team: "pro",
  ai_companion: "pro",
  team_dashboard: "pro",
  branding: "pro",
  bulk_enrollment: "institutional",
  csv_export: "pro",
  data_export: "institutional",
}

export const FEATURE_LABELS: Record<Feature, string> = {
  screening: "Basic screening: a quick, non-diagnostic check-in for each learner",
  screening_in_depth: "Full screening: bring in-depth Neu Rafiki assessment results into a learner's record",
  reports: "Monthly and quarterly progress reports",
  email_reports: "Email reports to family, teachers and therapists",
  support_team: "Invite caregivers, teachers and therapists to a support team",
  ai_companion: "AI chat with the Companion (beta, daily message limit)",
  team_dashboard: "Multi-user dashboard of all your learners and staff",
  branding: "Branded reports and report emails with your logo and colour",
  bulk_enrollment: "Bulk enrollment of learners from a CSV file",
  csv_export: "Spreadsheet (CSV) exports of learners, goals, progress, reports and records",
  data_export: "Organisation-wide export: everyone on your support teams and their access",
}

/** AI Companion messages per rolling 24h. Caps provider cost per subscriber. */
export const AI_DAILY_MESSAGES: Record<SubscriptionTier, number> = { free: 0, premium: 0, pro: 20, institutional: 40 }

/** Features every tier gets, including Free. Only list things that exist. */
export const BASE_FEATURES = [
  "Personalised IEP with suggested goals",
  "Goal check-ins and My Journey timeline",
  "Companion prompts and next steps from your own check-ins (no AI)",
  "Download all your own data any time, as one file (JSON)",
]

export function isTier(value: unknown): value is SubscriptionTier {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(TIER_RANK, value)
}

export interface SubscriptionRow {
  tier: string | null
  status: string | null
  renewal_date: string | null
  payment_transactions?: { status: string | null }[] | null
}

/**
 * The tier a user is actually entitled to right now. A paid tier only
 * counts if the row is active, unexpired, and backed by a successful
 * payment transaction (users can't insert payment_transactions rows, so a
 * hand-crafted subscriptions row can't grant anything). Anything else --
 * pending, cancelled, inactive, expired, unpaid -- is Free.
 */
export function effectiveTier(rows: SubscriptionRow[] | null | undefined, now: Date = new Date()): SubscriptionTier {
  let best: SubscriptionTier = "free"

  for (const row of rows ?? []) {
    if (row.status !== "active" || !isTier(row.tier)) continue
    if (!row.renewal_date || !(new Date(row.renewal_date).getTime() > now.getTime())) continue
    if (!(row.payment_transactions ?? []).some((tx) => tx.status === "successful")) continue
    if (TIER_RANK[row.tier] > TIER_RANK[best]) best = row.tier
  }

  return best
}

export function tierAllows(tier: SubscriptionTier, feature: Feature): boolean {
  return TIER_RANK[tier] >= TIER_RANK[FEATURE_MIN_TIER[feature]]
}

/** The next tier up, or the same tier if already at the top. */
export function nextTier(tier: SubscriptionTier): SubscriptionTier {
  return (Object.keys(TIER_RANK) as SubscriptionTier[]).find((t) => TIER_RANK[t] > TIER_RANK[tier]) ?? tier
}

/** Advertised feature list for a tier, derived from the gates above. */
export function tierFeatures(tier: SubscriptionTier): string[] {
  const limit = LEARNER_LIMITS[tier]
  return [
    `Up to ${limit} learner profile${limit === 1 ? "" : "s"}`,
    ...BASE_FEATURES,
    ...(Object.keys(FEATURE_MIN_TIER) as Feature[]).filter((f) => tierAllows(tier, f)).map((f) => FEATURE_LABELS[f]),
  ]
}

export interface Entitlement {
  tier: SubscriptionTier
  learnerLimit: number
  can: (feature: Feature) => boolean
}

/**
 * Resolves what the signed-in user is entitled to. Fails closed to Free.
 *
 * Asks the database first (public.entitled_tier, scripts/032) so the app
 * and the RLS/trigger checks use one rule. Until 032 is applied that RPC
 * doesn't exist, so it falls back to the identical TypeScript rule above.
 */
export async function getEntitlement(supabase: SupabaseClient, userId: string): Promise<Entitlement> {
  const rpc = await supabase.rpc("entitled_tier", { p_user: userId })
  if (!rpc.error && isTier(rpc.data)) {
    const tier = rpc.data
    return { tier, learnerLimit: LEARNER_LIMITS[tier], can: (feature) => tierAllows(tier, feature) }
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("tier, status, renewal_date, payment_transactions(status)")
    .eq("user_id", userId)
    .eq("status", "active")

  if (error) console.error("getEntitlement:", error)

  const tier = effectiveTier(error ? [] : (data as SubscriptionRow[]))
  return { tier, learnerLimit: LEARNER_LIMITS[tier], can: (feature) => tierAllows(tier, feature) }
}
