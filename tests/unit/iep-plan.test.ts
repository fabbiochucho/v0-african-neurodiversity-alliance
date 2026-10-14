import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  AI_DRAFT_SCHEMA,
  aiDraftPrompt,
  draftGoalsFromTemplates,
  firstOpenStep,
  GOAL_FIELDS,
  parseAiDraft,
  PLAN_SECTIONS,
  PLAN_STEPS,
  stepIsKnown,
  type PlanFacts,
} from "@/lib/iep-plan"
import { isOfficialGoal } from "@/lib/journey"
import { CONSENT_FIELDS, CONSENT_VERSION } from "@/lib/companion"

const sql = readFileSync("scripts/045_full_iep_plan.sql", "utf8")
const facts = (o: Partial<PlanFacts> = {}): PlanFacts => ({
  learner: { name: "Ada", age: 9, country: "Kenya" },
  profile: null,
  approvedGoalCount: 0,
  teamCount: 0,
  draftCount: 0,
  versionCount: 0,
  ...o,
})

describe("12-step flow", () => {
  it("has the brief's 12 steps in order", () => {
    expect(PLAN_STEPS.map((s) => s.title)).toEqual([
      "About the learner",
      "Strengths",
      "Difficulties",
      "What helps",
      "Current goals",
      "School context",
      "Support team",
      "Generate plan",
      "Review",
      "Approve",
      "Track",
      "Review and update",
    ])
  })

  it("never asks for what's already known: known steps are skipped when choosing where to start", () => {
    expect(firstOpenStep(facts())).toBe("strengths")
    const f = facts({ profile: { strengths: "drawing", difficulties: "noise", what_helps: "warnings", school_context: "Grade 3" } })
    expect(stepIsKnown("strengths", f)).toBe(true)
    expect(firstOpenStep(f)).toBe("current_goals")
    expect(firstOpenStep({ ...f, approvedGoalCount: 2, teamCount: 1, draftCount: 3 })).toBe("review")
  })

  it("every goal carries the brief's fields", () => {
    expect(GOAL_FIELDS.map((f) => f.key)).toEqual([
      "goal_text",
      "baseline",
      "target",
      "measurement",
      "frequency",
      "responsible_person",
      "support_strategy",
      "review_date",
      "evidence",
    ])
  })

  it("has every plan-level section from the brief, matching the SQL check", () => {
    for (const s of PLAN_SECTIONS) expect(sql).toContain(`'${s.key}'`)
    expect(PLAN_SECTIONS).toHaveLength(13)
  })
})

describe("drafting", () => {
  it("templates come from the existing goal-suggestion data, skip duplicates, and leave baseline to people", () => {
    const drafts = draftGoalsFromTemplates(["ADHD"], ["Improve sustained attention and focus"], new Date("2026-01-01T00:00:00Z"))
    expect(drafts.map((d) => d.goal_text)).not.toContain("Improve sustained attention and focus")
    expect(drafts.length).toBeGreaterThan(0)
    expect(drafts.every((d) => d.baseline === null && d.review_date === "2026-04-01")).toBe(true)
  })

  it("AI drafts are validated, trimmed and capped; bad shapes are rejected", () => {
    const r = parseAiDraft({
      goals: [{ goal_text: " Ask for help ", domain: "communication", target: "most days" }, { goal_text: "" }],
      items: [{ section: "sensory_strategies", content: "Quiet corner" }, { section: "made_up", content: "x" }],
    })
    expect(r?.goals).toHaveLength(1)
    expect(r?.goals[0]).toMatchObject({ goal_text: "Ask for help", baseline: null })
    expect(r?.items).toEqual([{ section: "sensory_strategies", content: "Quiet corner" }])
    expect(parseAiDraft({ goals: "nope" })).toBeNull()
    expect(AI_DRAFT_SCHEMA.required).toEqual(["goals", "items"])
  })

  it("the AI prompt uses only the first name and consented fields", () => {
    const p = aiDraftPrompt("Ada", { strengths: "drawing" }, ["Read aloud"])
    expect(p).toContain("Ada")
    expect(p).toContain("drawing")
    expect(p).not.toMatch(/age|date of birth/i)
    expect(CONSENT_FIELDS.join(" ")).toMatch(/support profile/)
    expect(CONSENT_VERSION).toBe("2026-10-v2")
  })
})

describe("approval rules (scripts/045)", () => {
  it("AI drafts can't be inserted as approved and approval is recorded only by approving", () => {
    expect(sql).toMatch(/new\.approval_status = 'approved' and new\.source = 'ai'/)
    expect(sql).toMatch(/Approval can only be recorded by approving/)
    expect(sql).toMatch(/function public\.approve_plan_items[\s\S]*has_permission\(learner, 'approve'\)/)
  })

  it("versions are kept on every approval", () => {
    expect(sql).toMatch(/insert into public\.iep_plan_versions/)
  })

  it("only approved goals are part of the official plan (tracking)", () => {
    expect(isOfficialGoal({ approval_status: "approved" })).toBe(true)
    expect(isOfficialGoal({})).toBe(true)
    expect(isOfficialGoal({ approval_status: "draft" })).toBe(false)
    expect(isOfficialGoal({ approval_status: "suggested" })).toBe(false)
  })
})
