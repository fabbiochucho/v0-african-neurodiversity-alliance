import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { NOT_A_DIAGNOSIS, parseAnswers, SCREENING_QUESTIONS, screeningFlag } from "@/lib/screening"
import { parseCsv, validateBulk } from "@/lib/bulk-enrollment"
import { toCsv } from "@/lib/data-export"
import { contrastWithWhite, validateAccent } from "@/lib/branding"
import { generateEmailHTML, generateReportContent } from "@/lib/reports-service"
import { FEATURE_MIN_TIER, tierAllows, tierFeatures } from "@/lib/entitlements"

describe("screening (non-diagnostic)", () => {
  const all = (v: string) => Object.fromEntries(SCREENING_QUESTIONS.map((q) => [q.id, v]))

  it("reuses the 5 self-test areas with observer wording", () => {
    expect(SCREENING_QUESTIONS.map((q) => q.id)).toEqual(["social", "attention", "sensory", "learning", "planning"])
    expect(SCREENING_QUESTIONS.every((q) => q.observerText.includes("they") || q.observerText.includes("them"))).toBe(true)
  })

  it("requires every answer", () => {
    expect(parseAnswers(all("often"))).not.toBeNull()
    expect(parseAnswers({ social: "often" })).toBeNull()
    expect(parseAnswers({ ...all("rarely"), social: "always" })).toBeNull()
  })

  it("flags only the areas answered 'often', with no score", () => {
    const flag = screeningFlag({ ...all("sometimes"), sensory: "often", learning: "often" })
    expect(flag.areasToLookInto).toEqual(["Sensory processing", "Reading & language"])
    expect(flag.considerProfessionalAssessment).toBe(true)
    expect(flag).not.toHaveProperty("score")
    expect(screeningFlag(all("sometimes")).considerProfessionalAssessment).toBe(false)
    expect(NOT_A_DIAGNOSIS).toMatch(/not a diagnosis/i)
  })

  it("the public self-test uses the same question set", () => {
    expect(readFileSync("app/self-test/page.tsx", "utf8")).toContain("SCREENING_QUESTIONS")
  })
})

describe("bulk enrollment CSV", () => {
  it("parses quotes, escaped quotes and CRLF", () => {
    expect(parseCsv('name,age\r\n"Doe, Jane",7\r\n"Say ""hi""",8\n')).toEqual([
      ["name", "age"],
      ["Doe, Jane", "7"],
      ['Say "hi"', "8"],
    ])
  })

  it("validates row by row and reports spreadsheet row numbers", () => {
    const csv = "name,age,gender,country,support_areas\nAda,9,F,Ghana,adhd;Dyslexia\n,5,,,\nBen,200,,,\nCleo,7,,,Autism\n"
    const r = validateBulk(csv, 10)
    expect(r.valid.map((v) => v.row)).toEqual([2])
    expect(r.valid[0].learner.diagnosis_domains).toEqual(["ADHD", "Dyslexia"])
    expect(r.errors.map((e) => e.row)).toEqual([3, 4, 5])
    expect(r.errors[0].message).toMatch(/name is required/)
    expect(r.errors[1].message).toMatch(/age/)
    expect(r.errors[2].message).toMatch(/unknown support area "Autism"/)
  })

  it("respects the remaining learner capacity", () => {
    const r = validateBulk("name\nA\nB\nC\n", 2)
    expect(r.valid).toHaveLength(2)
    expect(r.errors).toEqual([{ row: 4, message: "over your plan's learner limit, not added" }])
  })

  it("rejects files without a name column", () => {
    expect(validateBulk("first,last\nA,B\n", 5).errors[0].message).toMatch(/name/)
  })
})

describe("data export CSV", () => {
  it("escapes commas/quotes/newlines and neutralises spreadsheet formulas", () => {
    const csv = toCsv([{ a: 'x, "y"', b: "=HYPERLINK(1)", c: ["ADHD", "Sensory"], d: null }], ["a", "b", "c", "d"])
    expect(csv).toBe('a,b,c,d\r\n"x, ""y""",\'=HYPERLINK(1),ADHD;Sensory,\r\n')
  })
})

describe("branding", () => {
  it("only accepts accents that keep white text at WCAG AA", () => {
    expect(validateAccent("#2a7a69")).toEqual({ ok: true, color: "#2a7a69" })
    expect(validateAccent("#FFFF00").ok).toBe(false)
    expect(validateAccent("red").ok).toBe(false)
    expect(contrastWithWhite("#000000")).toBeCloseTo(21, 0)
  })

  it("applies logo, colour and name to report emails, escaped", () => {
    const html = generateEmailHTML(
      { content: "<script>x</script>" },
      { orgName: "Bright <Kids>", accentColor: "#1f4e79", logoUrl: "https://x.supabase.co/storage/v1/object/public/branding/u/logo.png" },
    )
    expect(html).toContain("background: #1f4e79")
    expect(html).toContain("Bright &lt;Kids&gt;")
    expect(html).toContain('<img src="https://x.supabase.co/')
    expect(html).not.toContain("<script>x</script>")
    expect(generateEmailHTML({ content: "hi" }, { orgName: null, accentColor: null, logoUrl: "javascript:alert(1)" })).not.toContain("<img")
  })

  it("adds 'Prepared by' to generated report content", () => {
    const content = generateReportContent({ name: "A", age: 5, country: "GH", diagnosis_domains: [] }, [], [], "monthly", "May", "Bright Kids")
    expect(content).toContain("Prepared by Bright Kids")
  })
})

describe("restored features are gated at their advertised tiers and advertised", () => {
  it("tiers", () => {
    expect(FEATURE_MIN_TIER).toMatchObject({
      screening: "free",
      screening_in_depth: "premium",
      team_dashboard: "pro",
      branding: "pro",
      bulk_enrollment: "institutional",
      data_export: "institutional",
    })
    expect(tierAllows("pro", "bulk_enrollment")).toBe(false)
    expect(tierAllows("institutional", "data_export")).toBe(true)
  })

  it("pricing lists them under those tiers", () => {
    expect(tierFeatures("free").join(" ")).toMatch(/Basic screening/)
    expect(tierFeatures("free").join(" ")).not.toMatch(/Bulk|Organisation-wide export|Branded/i)
    // Personal export is on every plan (NDPA data portability); org-wide is Institutional.
    expect(tierFeatures("free").join(" ")).toMatch(/Download your own data/)
    expect(tierFeatures("institutional").join(" ")).toMatch(/Bulk enrollment[\s\S]*Organisation-wide export/)
  })
})
