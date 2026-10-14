import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  DEFAULT_PREFERENCES,
  fromRow,
  parsePreferences,
  PREFERENCES_BOOT_SCRIPT,
  PREFERENCES_STORAGE_KEY,
  toRow,
} from "@/lib/preferences"
import { contrastWithWhite } from "@/lib/branding"

const css = readFileSync("app/globals.css", "utf8")

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
function block(selector: string) {
  const start = css.indexOf(`${selector} {`)
  const body = css.slice(start, css.indexOf("}", start))
  return Object.fromEntries(Array.from(body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g), (m) => [m[1], m[2]]))
}

describe("display preferences", () => {
  it("fills defaults and drops unknown values", () => {
    expect(parsePreferences(null)).toEqual(DEFAULT_PREFERENCES)
    expect(parsePreferences({ visual: "calm", text: "huge", contrast: "high" })).toEqual({ ...DEFAULT_PREFERENCES, visual: "calm", contrast: "high" })
  })

  it("maps to and from the DB row (text <-> text_size)", () => {
    const p = parsePreferences({ text: "xl", density: "compact" })
    expect(toRow(p)).toMatchObject({ text_size: "xl", density: "compact" })
    expect(fromRow(toRow(p))).toEqual(p)
    expect(fromRow(null)).toBeNull()
  })

  it("boot script applies saved choices before paint and survives bad storage", () => {
    const store: Record<string, string> = { [PREFERENCES_STORAGE_KEY]: JSON.stringify({ visual: "calm", text: "bogus" }) }
    const el = { dataset: {} as Record<string, string> }
    new Function("localStorage", "document", PREFERENCES_BOOT_SCRIPT)({ getItem: (k: string) => store[k] ?? null }, { documentElement: el })
    expect(el.dataset).toEqual({ ...DEFAULT_PREFERENCES, visual: "calm" })

    const broken = { dataset: {} as Record<string, string> }
    expect(() =>
      new Function("localStorage", "document", PREFERENCES_BOOT_SCRIPT)(
        { getItem: () => "{not json" },
        { documentElement: broken },
      ),
    ).not.toThrow()
  })
})

describe("high contrast meets WCAG AAA (7:1) for body text", () => {
  for (const selector of ['html[data-contrast="high"]', 'html.dark[data-contrast="high"]']) {
    it(selector, () => {
      const t = block(selector)
      expect(ratio(t.foreground, t.background)).toBeGreaterThanOrEqual(7)
      expect(ratio(t["muted-foreground"], t.background)).toBeGreaterThanOrEqual(7)
      expect(ratio(t["muted-foreground"], t.muted)).toBeGreaterThanOrEqual(7)
      expect(ratio(t["card-foreground"], t.card)).toBeGreaterThanOrEqual(7)
      expect(ratio(t.primary, t.background)).toBeGreaterThanOrEqual(7)
      expect(ratio(t["primary-foreground"], t.primary)).toBeGreaterThanOrEqual(7)
    })
  }
  it("helper sanity", () => {
    expect(contrastWithWhite("#000000")).toBeCloseTo(21, 0)
  })
})

describe("scripts/043", () => {
  const sql = readFileSync("scripts/043_preferences_audit_log_and_deletion.sql", "utf8")
  it("audit_log is written by server code only and read by the record owner", () => {
    expect(sql).toMatch(/audit_log_select_owner[\s\S]*owner_id = auth\.uid\(\)/)
    expect(sql).not.toMatch(/on public\.audit_log for (insert|update|delete)/)
  })
  it("deleting a user keeps payment records with user_id nulled", () => {
    expect(sql).toMatch(/subscriptions_user_id_fkey[\s\S]*on delete set null/)
  })
})

describe("privacy page wording", () => {
  it("makes no compliance claims", () => {
    const page = readFileSync("app/account/privacy/page.tsx", "utf8")
    expect(page).toContain("designed to support applicable data-protection")
    expect(page).not.toMatch(/\b(GDPR|POPIA|NDPR)[- ]compliant\b|fully compliant/i)
  })
})
