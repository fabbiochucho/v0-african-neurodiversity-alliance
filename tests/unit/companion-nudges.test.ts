import { describe, expect, it } from "vitest"
import { buildNudges, matchResources, thirtyDayChange, type NudgeGoal } from "@/lib/companion-nudges"
import {
  buildLearnerContext,
  CONSENT_VERSION,
  hasActiveConsent,
} from "@/lib/companion"
import { aiProvider, cloudflareText, DEFAULT_CLOUDFLARE_MODEL, extractJson, generate } from "@/lib/ai"

const now = new Date("2026-06-30T12:00:00Z")
const goal = (o: Partial<NudgeGoal>): NudgeGoal => ({
  id: "g",
  goal_text: "Ask for a break",
  domain: "behavior",
  status: "in_progress",
  target_completion_date: null,
  progress_logs: [],
  ...o,
})

describe("buildNudges (no AI)", () => {
  it("prompts a first check-in and a weekly check-in", () => {
    expect(buildNudges("Ada", [goal({})], now).map((n) => n.kind)).toEqual(["check_in"])
    const quiet = goal({ progress_logs: [{ rating: 3, logged_date: "2026-06-10" }] })
    expect(buildNudges("Ada", [quiet], now)[0].text).toMatch(/this week/)
    const fresh = goal({ progress_logs: [{ rating: 3, logged_date: "2026-06-29" }] })
    expect(buildNudges("Ada", [fresh], now)).toEqual([])
  })

  it("nudges a next step when a goal stalls", () => {
    const stuck = goal({
      progress_logs: [
        { rating: 2, logged_date: "2026-06-28" },
        { rating: 1, logged_date: "2026-06-25" },
        { rating: 2, logged_date: "2026-06-20" },
      ],
    })
    expect(buildNudges("Ada", [stuck], now).map((n) => n.kind)).toEqual(["stalled"])
  })

  it("flags review dates within 14 days or overdue, first", () => {
    const due = goal({ target_completion_date: "2026-07-05", progress_logs: [{ rating: 4, logged_date: "2026-06-29" }] })
    const overdue = goal({ id: "o", target_completion_date: "2026-06-01" })
    const kinds = buildNudges("Ada", [overdue, due], now).map((n) => n.kind)
    expect(kinds.slice(0, 2)).toEqual(["review_soon", "review_soon"])
    expect(buildNudges("Ada", [goal({ target_completion_date: "2026-09-01" })], now).some((n) => n.kind === "review_soon")).toBe(false)
  })

  it("encourages when the 30-day average rose versus the previous 30 days", () => {
    const g = goal({
      progress_logs: [
        { rating: 4, logged_date: "2026-06-29" },
        { rating: 4, logged_date: "2026-06-20" },
        { rating: 2, logged_date: "2026-05-20" },
      ],
    })
    expect(thirtyDayChange([g], now)).toEqual([{ area: "behavior", now: 4, then: 2 }])
    expect(buildNudges("Ada", [g], now).find((n) => n.kind === "encouragement")?.text).toMatch(/up from 2\.0/)
  })

  it("ignores goals that aren't in progress", () => {
    expect(buildNudges("Ada", [goal({ status: "achieved" })], now)).toEqual([])
  })
})

describe("matchResources", () => {
  const res = [
    { id: "1", title: "Understanding ADHD in the classroom", description: null, url: null, provider: null },
    { id: "2", title: "Sensory processing basics", description: "sensory diets", url: null, provider: null },
    { id: "3", title: "Gardening", description: "plants", url: null, provider: null },
  ]
  it("only returns real directory entries that mention the goal areas", () => {
    expect(matchResources(res, ["sensory"]).map((r) => r.id)).toEqual(["2"])
    expect(matchResources(res, ["attention"]).map((r) => r.id)).toEqual(["1"])
    expect(matchResources(res, [])).toEqual([])
  })
})

describe("AI chat model, consent and minimal context", () => {
  it("prefers free Cloudflare AI, falls back to Anthropic, and is off with neither", () => {
    expect(aiProvider({ CLOUDFLARE_ACCOUNT_ID: "a", CLOUDFLARE_AI_TOKEN: "t", ANTHROPIC_API_KEY: "k" })).toBe("cloudflare")
    expect(aiProvider({ CLOUDFLARE_ACCOUNT_ID: "a", ANTHROPIC_API_KEY: "k" })).toBe("anthropic")
    expect(aiProvider({ CLOUDFLARE_ACCOUNT_ID: " ", CLOUDFLARE_AI_TOKEN: "t" })).toBeNull()
    expect(aiProvider({})).toBeNull()
  })

  it("reads Cloudflare replies in both response shapes", () => {
    expect(cloudflareText({ result: { response: "Hello" } })).toBe("Hello")
    expect(cloudflareText({ result: { choices: [{ message: { content: "Hi" } }] } })).toBe("Hi")
    expect(cloudflareText({ success: false, errors: [] })).toBeNull()
  })

  it("pulls JSON out of chatty or fenced model replies", () => {
    expect(extractJson('Here you go:\n```json\n{"goals":[],"items":[]}\n```')).toEqual({ goals: [], items: [] })
    expect(extractJson('Sure! {"goals":[1]} Hope that helps')).toEqual({ goals: [1] })
    expect(extractJson("no json here")).toBeNull()
  })

  it("sends a chat request to the configured Cloudflare model", async () => {
    const calls: { url: string; body: { messages: { role: string }[]; max_tokens: number } }[] = []
    const realFetch = globalThis.fetch
    globalThis.fetch = (async (url: string, init: { body: string }) => {
      calls.push({ url, body: JSON.parse(init.body) })
      return new Response(JSON.stringify({ success: true, result: { response: " Try a visual timetable. " } }), { status: 200 })
    }) as unknown as typeof fetch
    try {
      const out = await generate({
        system: "rules",
        messages: [{ role: "user", content: "Mornings are hard" }],
        maxTokens: 100,
        env: { CLOUDFLARE_ACCOUNT_ID: "acc", CLOUDFLARE_AI_TOKEN: "tok" },
      })
      expect(out).toEqual({ ok: true, text: "Try a visual timetable." })
      expect(calls[0].url).toBe(`https://api.cloudflare.com/client/v4/accounts/acc/ai/run/${DEFAULT_CLOUDFLARE_MODEL}`)
      expect(calls[0].body.messages.map((m) => m.role)).toEqual(["system", "user"])
      expect(calls[0].body.max_tokens).toBe(100)
    } finally {
      globalThis.fetch = realFetch
    }
  })

  it("reports the free daily limit running out as busy", async () => {
    const realFetch = globalThis.fetch
    globalThis.fetch = (async () => new Response("{}", { status: 429 })) as unknown as typeof fetch
    try {
      const out = await generate({ system: "s", messages: [{ role: "user", content: "hi" }], maxTokens: 10, env: { CLOUDFLARE_ACCOUNT_ID: "a", CLOUDFLARE_AI_TOKEN: "t" } })
      expect(out).toEqual({ ok: false, reason: "busy" })
    } finally {
      globalThis.fetch = realFetch
    }
  })

  it("requires the latest consent event to be a grant of the current version", () => {
    const g = (created_at: string, action = "granted", consent_version = CONSENT_VERSION) => ({ action, consent_version, created_at })
    expect(hasActiveConsent([])).toBe(false)
    expect(hasActiveConsent([g("2026-01-01")])).toBe(true)
    expect(hasActiveConsent([g("2026-01-01"), g("2026-02-01", "revoked")])).toBe(false)
    expect(hasActiveConsent([g("2026-01-01", "revoked"), g("2026-02-01")])).toBe(true)
    expect(hasActiveConsent([g("2026-01-01", "granted", "old-version")])).toBe(false)
  })

  it("sends first name only, active goals and a 30-day summary -- no surname", () => {
    const text = buildLearnerContext(
      "Ada Okonkwo-Mensah",
      [
        { goal_text: "Read aloud", domain: "academic", status: "in_progress", progress_logs: [{ rating: 2, logged_date: "2026-06-10" }, { rating: 4, logged_date: "2026-06-25" }] },
        { goal_text: "Old goal", domain: "motor", status: "achieved", progress_logs: [] },
      ],
      now,
    )
    expect(text).toContain("supporting Ada ")
    expect(text).not.toMatch(/Okonkwo|Mensah/)
    expect(text).toContain("Read aloud (academic): 2 check-ins, average 3.0/5, trending up")
    expect(text).not.toContain("Old goal")
  })
})
