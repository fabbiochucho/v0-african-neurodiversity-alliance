// The full IEP (brief §18-19). Pure helpers for the 12-step flow, template
// drafting and validation of AI drafts. Database rules: scripts/045.

import { ADAPTIVE_GOALS, GOAL_DOMAINS } from "@/lib/constants/iep"
import type { SupportProfile } from "@/lib/learner-records"

export const PLAN_SECTIONS = [
  { key: "accommodations", label: "Accommodations" },
  { key: "modifications", label: "Modifications" },
  { key: "teaching_strategies", label: "Teaching strategies" },
  { key: "communication_strategies", label: "Communication strategies" },
  { key: "sensory_strategies", label: "Sensory strategies" },
  { key: "executive_function_strategies", label: "Executive-function strategies" },
  { key: "social_strategies", label: "Social strategies" },
  { key: "behavioural_strategies", label: "Behavioural strategies" },
  { key: "assistive_technology", label: "Assistive technology" },
  { key: "family_strategies", label: "Family strategies" },
  { key: "school_strategies", label: "School strategies" },
  { key: "professional_support", label: "Professional support" },
  { key: "timeline", label: "Timeline" },
] as const
export type PlanSection = (typeof PLAN_SECTIONS)[number]["key"]

/** Every goal carries these (brief §19), plus status. */
export const GOAL_FIELDS = [
  { key: "goal_text", label: "Goal" },
  { key: "baseline", label: "Baseline (where they are now)" },
  { key: "target", label: "Target" },
  { key: "measurement", label: "How it's measured" },
  { key: "frequency", label: "How often" },
  { key: "responsible_person", label: "Who's responsible" },
  { key: "support_strategy", label: "Support strategy" },
  { key: "review_date", label: "Review date" },
  { key: "evidence", label: "Evidence" },
] as const
export type GoalFieldKey = (typeof GOAL_FIELDS)[number]["key"]

export const PLAN_STEPS = [
  { key: "about", title: "About the learner" },
  { key: "strengths", title: "Strengths" },
  { key: "difficulties", title: "Difficulties" },
  { key: "what_helps", title: "What helps" },
  { key: "current_goals", title: "Current goals" },
  { key: "school_context", title: "School context" },
  { key: "support_team", title: "Support team" },
  { key: "generate", title: "Generate plan" },
  { key: "review", title: "Review" },
  { key: "approve", title: "Approve" },
  { key: "track", title: "Track" },
  { key: "review_update", title: "Review and update" },
] as const
export type PlanStepKey = (typeof PLAN_STEPS)[number]["key"]

export interface PlanFacts {
  learner: { name: string; age: number | null; country: string | null }
  profile: SupportProfile | null
  approvedGoalCount: number
  teamCount: number
  draftCount: number
  versionCount: number
}

/**
 * Which steps are already answered, so the flow never asks for something
 * it knows: known steps are shown as a summary with an option to change.
 */
export function stepIsKnown(step: PlanStepKey, f: PlanFacts): boolean {
  switch (step) {
    case "about":
      return Boolean(f.learner.name && f.learner.age != null && f.learner.country)
    case "strengths":
    case "difficulties":
    case "what_helps":
    case "school_context":
      return Boolean(f.profile?.[step]?.trim())
    case "current_goals":
      return f.approvedGoalCount > 0
    case "support_team":
      return f.teamCount > 0
    case "generate":
      return f.draftCount > 0 || f.versionCount > 0
    case "approve":
      return f.versionCount > 0 && f.draftCount === 0
    default:
      return false
  }
}

/** First step that still needs an answer (where the flow opens). */
export function firstOpenStep(f: PlanFacts): PlanStepKey {
  return PLAN_STEPS.find((s) => !stepIsKnown(s.key, f) && s.key !== "track" && s.key !== "review_update")?.key ?? "review"
}

export interface DraftGoal {
  goal_text: string
  domain: string
  baseline: string | null
  target: string | null
  measurement: string | null
  frequency: string | null
  support_strategy: string | null
  review_date: string | null
}

/** Template drafts from the existing goal-suggestion data (no AI). */
export function draftGoalsFromTemplates(diagnosisDomains: string[], existingGoalTexts: string[], now = new Date()): DraftGoal[] {
  const review = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const have = new Set(existingGoalTexts.map((t) => t.trim().toLowerCase()))
  const seen = new Set<string>()
  return diagnosisDomains
    .flatMap((d) => ADAPTIVE_GOALS[d as keyof typeof ADAPTIVE_GOALS] ?? [])
    .filter((g) => !have.has(g.suggestion.toLowerCase()) && !seen.has(g.suggestion) && seen.add(g.suggestion))
    .map((g) => ({
      goal_text: g.suggestion,
      domain: g.domain,
      baseline: null, // must come from people who know the learner
      target: g.metric,
      measurement: "Check-in rating (1-5) each week",
      frequency: "Weekly",
      support_strategy: null,
      review_date: review,
    }))
}

const SECTION_KEYS = PLAN_SECTIONS.map((s) => s.key) as string[]

// Open models don't all support forced JSON output, so the shape is spelled
// out in the prompt and parseAiDraft validates whatever comes back.
export const AI_DRAFT_JSON_INSTRUCTIONS = `Reply with only a JSON object, no other text, in exactly this shape:
{"goals":[{"goal_text":"...","domain":"one of: ${GOAL_DOMAINS.join(", ")}","target":"...","measurement":"...","frequency":"...","support_strategy":"..."}],
 "items":[{"section":"one of: ${PLAN_SECTIONS.map((p) => p.key).join(", ")}","content":"..."}]}`

/** Validates and trims an AI draft. Never trusts the model's shape. */
export function parseAiDraft(raw: unknown): { goals: DraftGoal[]; items: { section: PlanSection; content: string }[] } | null {
  if (!raw || typeof raw !== "object") return null
  const r = raw as { goals?: unknown; items?: unknown }
  if (!Array.isArray(r.goals) || !Array.isArray(r.items)) return null
  const text = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null)
  const goals = r.goals
    .slice(0, 6)
    .map((g: Record<string, unknown>) => ({
      goal_text: text(g?.goal_text, 300) ?? "",
      domain: (GOAL_DOMAINS as readonly string[]).includes(g?.domain as string) ? (g.domain as string) : "academic",
      baseline: null,
      target: text(g?.target, 300),
      measurement: text(g?.measurement, 200),
      frequency: text(g?.frequency, 100),
      support_strategy: text(g?.support_strategy, 500),
      review_date: null,
    }))
    .filter((g) => g.goal_text)
  const items = r.items
    .slice(0, 13)
    .map((i: Record<string, unknown>) => ({ section: i?.section as PlanSection, content: text(i?.content, 2000) ?? "" }))
    .filter((i) => SECTION_KEYS.includes(i.section) && i.content)
  return { goals, items }
}

/** What the AI draft is told (consent-gated: first name, support profile, current goals). */
export function aiDraftPrompt(firstName: string, profile: SupportProfile | null, currentGoals: string[]): string {
  const lines = Object.entries(profile ?? {}).map(([k, v]) => `- ${k.replace(/_/g, " ")}: ${v}`)
  return `Draft a support plan for ${firstName}.
What the family/team wrote:
${lines.length ? lines.join("\n") : "- (no support profile yet)"}
Current goals:
${currentGoals.length ? currentGoals.map((g) => `- ${g}`).join("\n") : "- none"}

Return up to 4 new goals (not duplicates) and up to 8 plan items across the sections. Practical, low-cost, strengths-based, suitable for African home and school settings. Do not include baselines, diagnoses, medication or anything clinical. Everything you write is a draft a person will review.`
}
