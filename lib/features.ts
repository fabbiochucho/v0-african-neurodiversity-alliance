// Feature switches managed on /admin/features (scripts/060). A feature with no row is on.
// Order: kill switch, then the most specific target (user, organisation, plan), then the
// global switch and the percentage rollout. Server-side only.
import { createServiceClient } from "@/lib/supabase/service"

export const FEATURES = {
  "ai.companion": "AI companion chat",
  "ai.plan_drafts": "AI-drafted support plans",
  screening: "Starting a screening",
  "community.posting": "Posting in the community",
} as const
export type FeatureKey = keyof typeof FEATURES
export const isFeatureKey = (k: unknown): k is FeatureKey => typeof k === "string" && k in FEATURES

export interface FeatureControl {
  key: string
  enabled: boolean
  killed: boolean
  rollout_percent: number
}
export interface FeatureTarget {
  scope: "user" | "organization" | "plan"
  scope_value: string
  enabled: boolean
}
export interface FeatureContext {
  userId?: string | null
  organizationId?: string | null
  plan?: string | null
}

/** Stable 0-99 bucket, so a person stays in or out of a percentage rollout. FNV-1a. */
export function bucket(key: string, userId: string): number {
  let h = 0x811c9dc5
  for (const c of `${key}:${userId}`) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h % 100
}

export function resolveFeature(control: FeatureControl | null, targets: FeatureTarget[], ctx: FeatureContext): boolean {
  if (!control) return true
  if (control.killed) return false
  const pick = (scope: FeatureTarget["scope"], value?: string | null) =>
    value ? targets.find((t) => t.scope === scope && t.scope_value === value) : undefined
  const target = pick("user", ctx.userId) ?? pick("organization", ctx.organizationId) ?? pick("plan", ctx.plan)
  if (target) return target.enabled
  if (!control.enabled) return false
  if (control.rollout_percent >= 100) return true
  return !!ctx.userId && bucket(control.key, ctx.userId) < control.rollout_percent
}

// ponytail: per-instance 30-second cache; a change on /admin/features takes up to 30 s to reach
// every server instance. Move to a shared cache if switches ever need to be instant everywhere.
const TTL_MS = 30_000
const cache = new Map<string, { at: number; control: FeatureControl | null; targets: FeatureTarget[] }>()

export function clearFeatureCache(key?: string) {
  if (key) cache.delete(key)
  else cache.clear()
}

async function load(key: FeatureKey) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) return hit
  const db = createServiceClient()
  const [{ data: control, error }, { data: targets }] = await Promise.all([
    db.from("feature_controls").select("key, enabled, killed, rollout_percent").eq("key", key).maybeSingle(),
    db.from("feature_targets").select("scope, scope_value, enabled").eq("feature_key", key),
  ])
  if (error) throw error
  const entry = { at: Date.now(), control: (control as FeatureControl | null) ?? null, targets: (targets ?? []) as FeatureTarget[] }
  cache.set(key, entry)
  return entry
}

/** Is this feature on for this person? Fails open (on) if the switches can't be read. */
export async function isEnabled(key: FeatureKey, ctx: FeatureContext = {}): Promise<boolean> {
  try {
    const { control, targets } = await load(key)
    // Look up the person's organisation and plan only when a target needs them.
    if (control && !control.killed && ctx.userId) {
      const db = createServiceClient()
      if (ctx.organizationId === undefined && targets.some((t) => t.scope === "organization")) {
        const { data } = await db.from("profiles").select("organization_id").eq("id", ctx.userId).maybeSingle()
        ctx = { ...ctx, organizationId: data?.organization_id ?? null }
      }
      if (ctx.plan === undefined && targets.some((t) => t.scope === "plan")) {
        const { data } = await db.rpc("entitled_tier", { p_user: ctx.userId })
        ctx = { ...ctx, plan: typeof data === "string" ? data : "free" }
      }
    }
    return resolveFeature(control, targets, ctx)
  } catch {
    console.error(`feature switch ${key} unreadable; treating as on`)
    return true
  }
}

export const FEATURE_OFF_MESSAGE = "This feature is switched off at the moment. Please try again later."
