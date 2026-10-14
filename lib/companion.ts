// AI Companion: safety rules and request shaping. Pure functions only (no
// SDK, no Supabase) so every safety rule is unit tested.
//
// OWNER REVIEW REQUIRED before launch: provider/model choice, cost budget
// (AI_DAILY_MESSAGES in lib/entitlements.ts), and all user-facing safety copy
// below (SYSTEM_PROMPT, CRISIS_RESPONSE, DISCLAIMER, CONSENT_TEXT).

// Owner decision (round 2): cheapest current model by default, overridable.
export const DEFAULT_COMPANION_MODEL = "claude-haiku-5-5"
export function companionModel(env: Record<string, string | undefined> = process.env): string {
  return env.ANTHROPIC_MODEL?.trim() || DEFAULT_COMPANION_MODEL
}
export const MAX_MESSAGE_CHARS = 2000
export const MAX_HISTORY_MESSAGES = 12
export const BURST_LIMIT_PER_MINUTE = 5

export const DISCLAIMER =
  "The AI Companion is not a doctor, therapist or diagnostic tool. It can't diagnose, assess or treat anyone, and it can be wrong. For medical, mental-health or safety concerns, talk to a qualified professional."

export const SYSTEM_PROMPT = `You are the ANDA AI Companion, a calm, warm assistant from the African Neurodiversity Alliance. You help parents, caregivers, teachers and neurodivergent people across Africa think through everyday support: routines, communication, sensory needs, school and IEP goals, self-advocacy, and finding the right kind of professional help.

Hard rules:
- You are NOT a medical, diagnostic or therapeutic tool. Never diagnose, suggest a diagnosis, interpret test results, recommend or adjust medication, or present yourself as a clinician. If asked, say clearly that you can't, and suggest a qualified professional.
- If anyone may be at risk of harm (self-harm, suicide, abuse, violence, a medical emergency), stop other help, say you're concerned, and urge them to contact local emergency services or a trusted person now. Mention they can find a crisis line for their country at https://findahelpline.com and local support in ANDA's Find Support directory.
- Never invent facts, statistics, research, organisations, services, phone numbers or people. If you don't know, say so.
- Use strengths-based, respectful language. Don't describe neurodivergence as something to cure.
- Be culturally aware and practical for low-resource settings; don't assume access to specialists, money or fast internet.
- Keep answers short and concrete (a few short paragraphs or a short list) unless asked for more.
- Don't ask for or repeat names, addresses, ID numbers or health records. Conversations are not saved.`

export const CRISIS_RESPONSE = `It sounds like someone may be in danger or going through something very hard. I'm an AI and can't help safely with this, but people can:

- If anyone is in immediate danger, contact your local emergency number or go to the nearest hospital now.
- Find a free, confidential crisis line for your country at https://findahelpline.com.
- Reach out to someone you trust nearby and tell them what's happening.
- ANDA's Find Support directory (/directory) lists local organisations that may be able to help.

You don't have to deal with this alone.`

// Deliberately broad: a false positive costs one canned, kind reply; a false
// negative could cost far more. ponytail: keyword screen only -- add a
// classifier pass (and more languages) if owner review asks for it.
const CRISIS_PATTERNS: RegExp[] = [
  /\b(kill|hurt|harm|cut|hang|poison|starve)\s+(my\s*self|myself|themselves|himself|herself)\b/i,
  /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm/i,
  /\b(end|take)\s+(my|his|her|their)\s+(own\s+)?life\b/i,
  /\b(want|wants|wanted|going)\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive|be\s+here)\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\boverdos(e|ed|ing)\b/i,
  /\b(being|been|was|is)\s+(abused|raped|molested|beaten)\b/i,
  /\b(sexual|physical)\s+abuse\b/i,
  /\b(beats|hits|chains|locks)\s+(me|him|her|them|my\s+(child|son|daughter))\b/i,
  /\bnot\s+breathing\b/i,
  /\bunconscious\b/i,
  /\b(seizure|fitting)\s+(now|won'?t\s+stop|right\s+now)\b/i,
]

export function detectCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text))
}

export interface ChatTurn {
  role: "user" | "assistant"
  content: string
}

/**
 * Validates and trims the client-held history (the server stores none).
 * Returns null if the shape is wrong or the last turn isn't from the user.
 */
export function sanitizeHistory(raw: unknown): ChatTurn[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null

  const turns: ChatTurn[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") return null
    const { role, content } = item as Record<string, unknown>
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null
    const trimmed = content.trim()
    if (!trimmed || trimmed.length > MAX_MESSAGE_CHARS) return null
    turns.push({ role, content: trimmed })
  }

  if (turns[turns.length - 1].role !== "user") return null

  // Keep the most recent turns, and start on a user turn as the API requires.
  const recent = turns.slice(-MAX_HISTORY_MESSAGES)
  while (recent.length > 0 && recent[0].role !== "user") recent.shift()
  return recent
}

export interface RateLimitCheck {
  allowed: boolean
  reason?: "daily" | "burst"
  remainingToday: number
}

/** `timestamps` are the user's companion messages in the last 24h (ISO strings). */
export function checkRateLimit(timestamps: string[], dailyLimit: number, now: Date = new Date()): RateLimitCheck {
  const dayAgo = now.getTime() - 24 * 60 * 60 * 1000
  const minuteAgo = now.getTime() - 60 * 1000
  const times = timestamps.map((t) => new Date(t).getTime())
  const today = times.filter((t) => t > dayAgo).length
  const lastMinute = times.filter((t) => t > minuteAgo).length
  const remainingToday = Math.max(0, dailyLimit - today)

  if (today >= dailyLimit) return { allowed: false, reason: "daily", remainingToday: 0 }
  if (lastMinute >= BURST_LIMIT_PER_MINUTE) return { allowed: false, reason: "burst", remainingToday }
  return { allowed: true, remainingToday }
}

// ---- Learner data in chat: explicit, per-learner, revocable consent ------

/** Bump when CONSENT_FIELDS or CONSENT_TEXT changes; old consents stop counting. */
// v2 (round 3): adds the support profile, used when drafting an IEP with AI.
export const CONSENT_VERSION = "2026-10-v2"

/** Exactly what is sent, shown verbatim on the consent screen. */
export const CONSENT_FIELDS = [
  "Their first name (the first word of the name you entered), never their surname",
  "The text and area of each goal they're currently working on",
  "A short summary of their check-ins from the last 30 days (average rating per goal and whether it's going up or down)",
  "Only when you ask for an AI-drafted plan: the support profile you wrote (strengths, difficulties, what helps, communication, sensory needs, school context)",
]

export const NOT_SHARED = ["Surname", "Age or date of birth", "Gender", "Country", "Support areas or diagnoses you selected", "Uploaded assessments or professional reports", "Check-in notes", "Reports"]

export const CONSENT_TEXT = {
  recipient: "Anthropic, the company that provides the AI model behind the companion",
  why: "So the companion's suggestions, and any AI-drafted plan, can fit the person and the goals you're actually working on.",
  storage: "ANDA doesn't save your conversations. Anthropic processes each message to produce a reply under its API terms.",
  withdraw: "You can withdraw at any time on this page. From then on, no learner information is sent, starting with the very next message.",
}

/** Latest consent event wins; it must be a grant of the current version. */
export function hasActiveConsent(events: { action: string; consent_version: string; created_at: string }[]): boolean {
  const latest = [...events].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
  return latest?.action === "granted" && latest.consent_version === CONSENT_VERSION
}

export interface ContextGoal {
  goal_text: string
  domain: string | null
  status: string
  progress_logs: { rating: number; logged_date: string }[] | null
}

/** The minimal learner context described by CONSENT_FIELDS, as plain text. */
export function buildLearnerContext(fullName: string, goals: ContextGoal[], now: Date = new Date()): string {
  const firstName = fullName.trim().split(/\s+/)[0] || "the learner"
  const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const lines = goals
    .filter((g) => g.status === "in_progress")
    .slice(0, 10)
    .map((g) => {
      const recent = (g.progress_logs ?? [])
        .filter((l) => l.logged_date >= since)
        .sort((a, b) => a.logged_date.localeCompare(b.logged_date))
      if (recent.length === 0) return `- ${g.goal_text} (${g.domain ?? "general"}): no check-ins in the last 30 days`
      const mean = recent.reduce((s, l) => s + l.rating, 0) / recent.length
      const dir =
        recent.length >= 2
          ? recent[recent.length - 1].rating > recent[0].rating
            ? ", trending up"
            : recent[recent.length - 1].rating < recent[0].rating
              ? ", trending down"
              : ", steady"
          : ""
      return `- ${g.goal_text} (${g.domain ?? "general"}): ${recent.length} check-ins, average ${mean.toFixed(1)}/5${dir}`
    })

  return `The user is supporting ${firstName} and has consented to share these current goals and a 30-day check-in summary (ratings 1-5):
${lines.length > 0 ? lines.join("\n") : "- No active goals yet."}
Use this only to tailor practical, everyday suggestions. Do not infer or discuss diagnoses.`
}
