// ANDA's half of the round-3 cross-app contract with Neu Rafiki. Pure
// functions only (shapes, validation, deep links) so every rule is tested;
// the network/DB parts live in lib/federation/remote.ts and the routes.
//
// Billing stays separate: these payloads only *describe* each product's
// plan. Nothing here grants the other product's features.

import { tierAllows } from "@/lib/entitlements"
import type { SubscriptionTier } from "@/lib/types/iep"

export interface AndaEntitlements {
  product: "anda"
  plan: SubscriptionTier
  entitlements: { iep: boolean; goals: boolean; progress: boolean; reports: boolean; support_team: boolean }
}

export interface NeuRafikiEntitlements {
  product: "neurafiki"
  plan: string
  entitlements: { assessment: boolean; ai_companion: boolean; check_ins: boolean; follow_up: boolean }
}

export function andaEntitlementsPayload(tier: SubscriptionTier): AndaEntitlements {
  return {
    product: "anda",
    plan: tier,
    entitlements: {
      iep: true,
      goals: true,
      progress: true,
      reports: tierAllows(tier, "reports"),
      support_team: tierAllows(tier, "support_team"),
    },
  }
}

/** Validates Neu Rafiki's response; null if it doesn't match the contract. */
export function parseNeuRafikiEntitlements(raw: unknown): NeuRafikiEntitlements | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as Record<string, unknown>
  const e = r.entitlements as Record<string, unknown> | undefined
  if (r.product !== "neurafiki" || typeof r.plan !== "string" || !e) return null
  const keys = ["assessment", "ai_companion", "check_ins", "follow_up"] as const
  if (!keys.every((k) => typeof e[k] === "boolean")) return null
  return {
    product: "neurafiki",
    plan: r.plan.slice(0, 40),
    entitlements: Object.fromEntries(keys.map((k) => [k, e[k] as boolean])) as NeuRafikiEntitlements["entitlements"],
  }
}

// ---- Check-in summaries ------------------------------------------------------

export interface CheckInSummary {
  learner_ref: string
  date: string
  goal_title: string | null
  summary: string
  answers: { question_id: string; answer: number | boolean | string }[]
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TOKEN = /^[a-z0-9_]{1,40}$/

/**
 * Structured answers only: numbers, booleans, or short enumerated codes
 * (lower_snake_case, <= 40 chars). Anything that looks like free text is
 * rejected, so no free-text PII can arrive through answers.
 */
export function validateCheckInSummary(raw: unknown): { ok: true; value: CheckInSummary } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "body must be an object" }
  const r = raw as Record<string, unknown>
  if (typeof r.learner_ref !== "string" || !UUID.test(r.learner_ref)) return { ok: false, error: "learner_ref must be a learner ref" }
  if (typeof r.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return { ok: false, error: "date must be YYYY-MM-DD" }
  if (r.goal_title != null && (typeof r.goal_title !== "string" || r.goal_title.length > 300)) {
    return { ok: false, error: "goal_title must be a string up to 300 characters" }
  }
  if (typeof r.summary !== "string" || r.summary.trim() === "" || r.summary.length > 1000) {
    return { ok: false, error: "summary must be 1-1000 characters" }
  }
  if (!Array.isArray(r.answers) || r.answers.length > 50) return { ok: false, error: "answers must be a list of up to 50 items" }

  const answers: CheckInSummary["answers"] = []
  for (const a of r.answers) {
    const item = a as Record<string, unknown>
    if (!item || typeof item.question_id !== "string" || !TOKEN.test(item.question_id)) {
      return { ok: false, error: "each answer needs a question_id code" }
    }
    const v = item.answer
    const structured =
      (typeof v === "number" && Number.isFinite(v)) || typeof v === "boolean" || (typeof v === "string" && TOKEN.test(v))
    if (!structured) return { ok: false, error: `answer for ${item.question_id} must be a number, boolean or short code (no free text)` }
    answers.push({ question_id: item.question_id, answer: v as number | boolean | string })
  }

  return {
    ok: true,
    value: {
      learner_ref: r.learner_ref.toLowerCase(),
      date: r.date,
      goal_title: (r.goal_title as string | null | undefined)?.trim() || null,
      summary: r.summary.trim(),
      answers,
    },
  }
}

// ---- Deep links into Neu Rafiki ---------------------------------------------

/** The federated learner ref is this app's learner id: opaque, no personal data. */
export function neuRafikiLinks(baseUrl: string) {
  const at = (path: string, params: Record<string, string> = {}) => {
    const url = new URL(path, baseUrl)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    return url.toString()
  }
  return {
    checkIn: (learnerRef: string, goalTitle?: string) =>
      at("/check-in", { from: "anda", learner: learnerRef, ...(goalTitle ? { goal: goalTitle } : {}) }),
    assessment: () => at("/assessment/start", { from: "anda" }),
    account: () => at("/account"),
  }
}
