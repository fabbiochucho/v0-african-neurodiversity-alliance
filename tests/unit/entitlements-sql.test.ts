// Keeps the SQL twin of lib/entitlements.ts (scripts/032 and later) in step
// with the TypeScript constants. If you change a cap or a gate in one place,
// this fails until the other matches.
import { readdirSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { FEATURE_MIN_TIER, LEARNER_LIMITS, TIER_RANK } from "@/lib/entitlements"

const sql032 = readFileSync("scripts/032_enforce_tier_limits_in_db.sql", "utf8")
const allSql = readdirSync("scripts")
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(`scripts/${f}`, "utf8"))
  .join("\n")

function sqlCase(fn: string): Record<string, number> {
  const body = sql032.slice(sql032.indexOf(`function public.${fn}(`))
  const match = body.match(/select case p_tier ([\s\S]*?) else (\d+) end/)!
  const out: Record<string, number> = { free: Number(match[2]) }
  for (const [, tier, n] of match[1].matchAll(/when '(\w+)' then (\d+)/g)) out[tier] = Number(n)
  return out
}

describe("SQL entitlement functions match lib/entitlements.ts", () => {
  it("tier_rank matches TIER_RANK", () => {
    expect(sqlCase("tier_rank")).toEqual(TIER_RANK)
  })

  it("learner_limit matches LEARNER_LIMITS (owner-approved 1/3/10/50)", () => {
    expect(sqlCase("learner_limit")).toEqual(LEARNER_LIMITS)
    expect(LEARNER_LIMITS).toEqual({ free: 1, premium: 3, pro: 10, institutional: 50 })
  })

  it("entitled_tier requires active + unexpired + successful payment, like effectiveTier", () => {
    expect(sql032).toMatch(/s\.status = 'active'/)
    expect(sql032).toMatch(/s\.renewal_date > now\(\)/)
    expect(sql032).toMatch(/t\.status = 'successful'/)
  })

  it("every gated feature has a matching tier_allows() check in some migration", () => {
    for (const [feature, tier] of Object.entries(FEATURE_MIN_TIER)) {
      expect(allSql, `${feature} should be gated at '${tier}' in SQL`).toMatch(
        new RegExp(`tier_allows\\(.*'${tier}'\\)\\s*--\\s*gate:${feature}\\b`),
      )
    }
  })
})
