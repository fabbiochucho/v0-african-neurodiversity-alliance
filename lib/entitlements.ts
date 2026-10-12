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

export type Feature = "reports" | "email_reports"

export const FEATURE_MIN_TIER: Record<Feature, SubscriptionTier> = {
  reports: "premium",
  email_reports: "pro",
}

export const FEATURE_LABELS: Record<Feature, string> = {
  reports: "Monthly and quarterly progress reports",
  email_reports: "Email reports to family, teachers and therapists",
}

/** Features every tier gets, including Free. Only list things that exist. */
export const BASE_FEATURES = ["Personalised IEP with suggested goals", "Progress tracking"]

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
 * Reads the signed-in user's subscriptions (via their own RLS-scoped
 * client) and resolves what they're entitled to. Fails closed to Free.
 */
export async function getEntitlement(supabase: SupabaseClient, userId: string): Promise<Entitlement> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("tier, status, renewal_date, payment_transactions(status)")
    .eq("user_id", userId)
    .eq("status", "active")

  if (error) console.error("getEntitlement:", error)

  const tier = effectiveTier(error ? [] : (data as SubscriptionRow[]))
  return { tier, learnerLimit: LEARNER_LIMITS[tier], can: (feature) => tierAllows(tier, feature) }
}
