import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { summariseAssessments } from "@/lib/federation/import-summary"
import { EDUCATION_CONTEXTS, t, termsFor } from "@/lib/i18n"
import { CALM_SAVE_ERROR, calmMessage } from "@/lib/calm"

const remote = {
  results: [
    {
      profile_ref: { name: "Ada", age: 9, diagnosis_domains: [] },
      domains: [
        { domain_name: "ADHD", risk_level: "moderate", percentage_score: 61, recommendations: "..." },
        { domain_name: "Sensory Processing", risk_level: "low", percentage_score: 20, recommendations: null },
        { domain_name: "Something new", risk_level: "high", percentage_score: 90, recommendations: null },
      ],
      completed_at: "2026-09-01T10:00:00Z",
      source: "neurafiki",
      source_assessment_id: "asmt-1",
    },
    {
      profile_ref: { name: "Ben", age: 12, diagnosis_domains: [] },
      domains: [{ domain_name: "Dyslexia/Learning Differences", risk_level: "high", percentage_score: 80, recommendations: null }],
      completed_at: "2026-09-02T10:00:00Z",
      source: "neurafiki",
      source_assessment_id: "asmt-2",
    },
  ],
}

describe("NeuRafiki handoff import (brief §14, §43)", () => {
  it("summarises domain results only, keeping NeuRafiki's own levels, and can pick one assessment", () => {
    const all = summariseAssessments(remote)
    expect(all).toHaveLength(2)
    expect(all[0]).toMatchObject({ sourceAssessmentId: "asmt-1", profileName: "Ada", areas: ["ADHD", "Sensory"] })
    expect(all[0].summary).toContain("ADHD: moderate")
    expect(all[0].summary).not.toContain("61") // no scores or raw responses
    expect(summariseAssessments(remote, "asmt-2").map((s) => s.profileName)).toEqual(["Ben"])
    expect(summariseAssessments(remote, "nope")).toEqual([])
    expect(summariseAssessments(null)).toEqual([])
  })

  it("the handoff landing and actions exist with the contract paths", () => {
    expect(existsSync("app/welcome/from-neurafiki/page.tsx")).toBe(true)
    const actions = readFileSync("components/neurafiki-actions.tsx", "utf8")
    for (const label of ["Check in with NeuRafiki", "Review my goals", "What changed?", "Prepare for review", "Update assessment"]) {
      expect(actions).toContain(label)
    }
  })
})

describe("localisation (brief §40-41)", () => {
  it("offers the brief's education contexts", () => {
    expect(EDUCATION_CONTEXTS.map((c) => c.value)).toEqual([
      "nigeria_inclusive",
      "kenya_cbc",
      "south_africa_sias",
      "uk_ehcp",
      "us_idea_504",
      "other",
    ])
  })

  it("only changes terminology, with a no-legal-claims disclaimer", () => {
    expect(termsFor("nigeria_inclusive").planShort).toBe("IEP")
    expect(termsFor("south_africa_sias").planShort).toBe("Support Plan")
    expect(termsFor("uk_ehcp").planName).toContain("EHCP")
    expect(termsFor("garbage").planShort).toBe("Support Plan")
    expect(termsFor("us_idea_504").disclaimer).toMatch(/isn't a legal document/)
    for (const c of EDUCATION_CONTEXTS) expect(termsFor(c.value).disclaimer).not.toMatch(/compliant|complies/i)
  })

  it("t() interpolates and falls back to English", () => {
    expect(t("plan.quarterlyReview", { plan: "EHCP" })).toBe("Quarterly EHCP review")
    expect(t("plan.quarterlyReview", { plan: "IEP" }, "fr")).toBe("Quarterly IEP review")
  })
})

describe("calm states (brief §55-56)", () => {
  it("never shows raw errors", () => {
    expect(calmMessage(new TypeError("Failed to fetch"))).toBe(CALM_SAVE_ERROR)
    expect(calmMessage(new Error("Internal server error"))).toBe(CALM_SAVE_ERROR)
    expect(calmMessage(new Error("Unexpected token < in JSON"))).toBe(CALM_SAVE_ERROR)
    expect(calmMessage(new Error("Choose a role."))).toBe("Choose a role.")
  })

  it("has calm error, not-found and global-error pages, and the dashboard empty state", () => {
    for (const f of ["app/error.tsx", "app/not-found.tsx", "app/global-error.tsx", "components/empty-state.tsx"]) expect(existsSync(f), f).toBe(true)
    expect(readFileSync("app/error.tsx", "utf8")).toContain("Your information is still here. Try again.")
    const dash = readFileSync("app/dashboard/page.tsx", "utf8")
    for (const s of ['t("dashboard.empty.title")', "Create Support Profile", "Add existing assessment", "Start NeuraFiki Assessment"]) expect(dash).toContain(s)
    expect(t("dashboard.empty.title")).toBe("Your journey starts here.")
  })

  it("no API route answers with a raw 'Internal server error'", () => {
    const { globSync } = require("node:fs") as { globSync?: (p: string) => string[] }
    const files = globSync ? globSync("app/api/**/route.ts") : []
    for (const f of files) expect(readFileSync(f, "utf8"), f).not.toContain('"Internal server error"')
  })
})
