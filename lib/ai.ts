// One place that talks to the AI provider, so the companion and plan drafting
// don't care which one is configured.
//
// Cloudflare Workers AI is preferred: its Free plan includes a daily
// allowance and stops (never bills) when it runs out, and Cloudflare doesn't
// train models on customer content. Anthropic stays available as an option.
// Neither configured = AI features stay off and the no-AI companion is used.

import Anthropic from "@anthropic-ai/sdk"

export type AiProviderId = "cloudflare" | "anthropic"

// Shown on the consent screen, so families know who processes what is sent.
export const PROVIDERS: Record<AiProviderId, { recipient: string; storage: string }> = {
  cloudflare: {
    recipient: "Cloudflare, which runs the open AI model (Meta's Llama) behind the companion",
    storage:
      "ANDA doesn't save your conversations. Cloudflare processes each message to produce a reply and says it doesn't use customer content to train AI models.",
  },
  anthropic: {
    recipient: "Anthropic, the company that provides the AI model behind the companion",
    storage: "ANDA doesn't save your conversations. Anthropic processes each message to produce a reply under its API terms.",
  },
}

export const DEFAULT_CLOUDFLARE_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
export const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-5-5"

export function aiProvider(env: Record<string, string | undefined> = process.env): AiProviderId | null {
  if (env.CLOUDFLARE_ACCOUNT_ID?.trim() && env.CLOUDFLARE_AI_TOKEN?.trim()) return "cloudflare"
  if (env.ANTHROPIC_API_KEY?.trim()) return "anthropic"
  return null
}

export interface ChatTurn {
  role: "user" | "assistant"
  content: string
}

export type AiResult =
  | { ok: true; text: string }
  | { ok: false; reason: "not_configured" | "refused" | "busy" | "error" }

// Reads the reply text from a Workers AI response. Older chat models return
// { result: { response } }; OpenAI-compatible ones return choices[].
export function cloudflareText(body: unknown): string | null {
  const result = (body as { result?: unknown })?.result as
    | { response?: unknown; choices?: { message?: { content?: unknown } }[] }
    | undefined
  if (typeof result?.response === "string") return result.response
  const content = result?.choices?.[0]?.message?.content
  return typeof content === "string" ? content : null
}

export async function generate(opts: {
  system: string
  messages: ChatTurn[]
  maxTokens: number
  env?: Record<string, string | undefined>
}): Promise<AiResult> {
  const env = opts.env ?? process.env
  const provider = aiProvider(env)
  if (!provider) return { ok: false, reason: "not_configured" }

  if (provider === "cloudflare") {
    const model = env.CLOUDFLARE_AI_MODEL?.trim() || DEFAULT_CLOUDFLARE_MODEL
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID!.trim()}/ai/run/${model}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${env.CLOUDFLARE_AI_TOKEN!.trim()}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "system", content: opts.system }, ...opts.messages],
            max_tokens: opts.maxTokens,
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(45_000),
        },
      )
      // 429 = rate limited; on the Free plan the daily allowance running out
      // also surfaces as an error here. Either way: "busy, try later".
      if (res.status === 429) return { ok: false, reason: "busy" }
      const body = await res.json().catch(() => null)
      const text = res.ok ? cloudflareText(body) : null
      if (text === null) {
        console.error("ai: cloudflare error", res.status)
        return { ok: false, reason: res.status >= 500 || res.status === 403 ? "busy" : "error" }
      }
      return { ok: true, text: text.trim() }
    } catch {
      console.error("ai: cloudflare network error")
      return { ok: false, reason: "error" }
    }
  }

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
    const response = await client.messages.create({
      model: env.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL,
      max_tokens: opts.maxTokens,
      output_config: { effort: "low" },
      system: opts.system,
      messages: opts.messages,
    })
    if (response.stop_reason === "refusal") return { ok: false, reason: "refused" }
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim()
    return { ok: true, text }
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return { ok: false, reason: "busy" }
    console.error("ai: anthropic error", err instanceof Anthropic.APIError ? err.status : "network")
    return { ok: false, reason: "error" }
  }
}

// Pulls the first JSON object out of a model reply. Open models sometimes wrap
// JSON in prose or ``` fences even when asked not to.
export function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.indexOf("{")
  const end = candidate.lastIndexOf("}")
  if (start === -1 || end <= start) return null
  try {
    return JSON.parse(candidate.slice(start, end + 1))
  } catch {
    return null
  }
}
