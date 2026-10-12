import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  andaEntitlementsPayload,
  neuRafikiLinks,
  parseNeuRafikiEntitlements,
  validateCheckInSummary,
} from "@/lib/federation/contract"
import { parseExistingAssessment, parseSupportProfile } from "@/lib/learner-records"
import { PATHWAYS } from "@/lib/pathways"

const LEARNER = "3f1c2a7e-8b4d-4c1e-9a2b-1234567890ab"

describe("cross-app contract: ANDA entitlements payload", () => {
  it("has the exact contract shape and follows ANDA's own gates only", () => {
    expect(andaEntitlementsPayload("free")).toEqual({
      product: "anda",
      plan: "free",
      entitlements: { iep: true, goals: true, progress: true, reports: false, support_team: false },
    })
    expect(andaEntitlementsPayload("pro").entitlements).toMatchObject({ reports: true, support_team: true })
  })
})

describe("cross-app contract: Neu Rafiki entitlements", () => {
  it("accepts the contract shape and rejects anything else", () => {
    const ok = { product: "neurafiki", plan: "plus", entitlements: { assessment: true, ai_companion: false, check_ins: true, follow_up: false } }
    expect(parseNeuRafikiEntitlements(ok)).toEqual(ok)
    expect(parseNeuRafikiEntitlements({ ...ok, product: "anda" })).toBeNull()
    expect(parseNeuRafikiEntitlements({ ...ok, entitlements: { assessment: "yes" } })).toBeNull()
    expect(parseNeuRafikiEntitlements(null)).toBeNull()
  })
})

describe("cross-app contract: check-in summary", () => {
  const base = {
    learner_ref: LEARNER,
    date: "2026-10-01",
    goal_title: "Ask for a break",
    summary: "Calmer mornings this week.",
    answers: [
      { question_id: "mood", answer: 4 },
      { question_id: "slept_well", answer: true },
      { question_id: "energy", answer: "low" },
    ],
  }

  it("accepts structured answers", () => {
    const r = validateCheckInSummary(base)
    expect(r.ok).toBe(true)
  })

  it("rejects free-text answers (no free-text PII through answers)", () => {
    const r = validateCheckInSummary({ ...base, answers: [{ question_id: "notes", answer: "She told her teacher Mrs Okafor about..." }] })
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/no free text/) })
  })

  it("rejects bad refs, dates, and oversized summaries", () => {
    expect(validateCheckInSummary({ ...base, learner_ref: "Ada" }).ok).toBe(false)
    expect(validateCheckInSummary({ ...base, date: "01/10/2026" }).ok).toBe(false)
    expect(validateCheckInSummary({ ...base, summary: "x".repeat(1001) }).ok).toBe(false)
  })
})

describe("deep links into Neu Rafiki", () => {
  it("matches the contract paths and params", () => {
    const links = neuRafikiLinks("https://nr.example")
    const checkIn = new URL(links.checkIn(LEARNER, "Read aloud & spell"))
    expect(checkIn.pathname).toBe("/check-in")
    expect(Object.fromEntries(checkIn.searchParams)).toEqual({ from: "anda", learner: LEARNER, goal: "Read aloud & spell" })
    expect(links.assessment()).toBe("https://nr.example/assessment/start?from=anda")
    expect(links.account()).toBe("https://nr.example/account")
  })
})

describe("support profile and existing assessments", () => {
  it("keeps non-empty sections and rejects empty or oversized profiles", () => {
    expect(parseSupportProfile({ strengths: " drawing ", difficulties: "" })).toEqual({ strengths: "drawing" })
    expect(parseSupportProfile({})).toBeNull()
    expect(parseSupportProfile({ strengths: "x".repeat(2001) })).toBeNull()
  })

  it("validates an existing assessment", () => {
    expect(parseExistingAssessment({ record_type: "diagnosis", summary: "ADHD, combined", record_date: "2025-03-01", author: "Dr A" })).toMatchObject({
      record_type: "diagnosis",
      record_date: "2025-03-01",
    })
    expect(parseExistingAssessment({ record_type: "made_up", summary: "x" })).toEqual({ error: expect.any(String) })
    expect(parseExistingAssessment({ record_type: "diagnosis", summary: " " })).toEqual({ error: expect.any(String) })
  })
})

describe("scripts/042", () => {
  const sql = readFileSync("scripts/042_learner_records_and_files.sql", "utf8")
  it("users can only add observations/professional input; check-ins and assessments are server-only", () => {
    expect(sql).toMatch(/kind in \('observation', 'professional_input'\)/)
    expect(sql).not.toMatch(/learner_records for update/)
  })
  it("assessment files are in a private bucket with owner-only access", () => {
    expect(sql).toMatch(/'learner-files', 'learner-files', false/)
  })
})

describe("home-page pathways", () => {
  it("every step links to a page that exists", () => {
    for (const p of PATHWAYS) {
      for (const step of p.steps) {
        const route = step.href.replace(/^\//, "")
        expect(existsSync(`app/${route}/page.tsx`), step.href).toBe(true)
      }
    }
  })
})
