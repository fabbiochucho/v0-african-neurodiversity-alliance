import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse, upgradeRequiredResponse } from "@/lib/api-error"
import { AI_DAILY_MESSAGES, FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import {
  checkRateLimit,
  COMPANION_MODEL,
  CRISIS_RESPONSE,
  detectCrisis,
  sanitizeHistory,
  SYSTEM_PROMPT,
} from "@/lib/companion"

// POST /api/companion  { messages: [{ role, content }, ...] }
//
// Stateless by design: the browser holds the conversation, nothing about
// its content is stored or logged here. Only (user_id, created_at) is
// recorded, for rate limiting.
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "The AI Companion isn't configured yet." }, { status: 503 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const entitlement = await getEntitlement(supabase, user.id)
  if (!entitlement.can("ai_companion")) {
    return upgradeRequiredResponse("The AI Companion is part of the Pro plan.", FEATURE_MIN_TIER.ai_companion)
  }

  const history = sanitizeHistory((await request.json().catch(() => null))?.messages)
  if (!history) {
    return NextResponse.json({ error: "Invalid conversation" }, { status: 400 })
  }

  // Safety gate first: crisis messages never go to the model and don't
  // count against the user's limit.
  if (detectCrisis(history[history.length - 1].content)) {
    return NextResponse.json({ reply: CRISIS_RESPONSE, crisis: true })
  }

  const { data: usage, error: usageError } = await supabase
    .from("ai_companion_usage")
    .select("created_at")
    .eq("user_id", user.id)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  if (usageError) return dbErrorResponse(usageError, 500)

  const limit = checkRateLimit(
    (usage ?? []).map((u) => u.created_at),
    AI_DAILY_MESSAGES[entitlement.tier],
  )
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          limit.reason === "daily"
            ? "You've reached today's AI Companion limit. It resets over the next 24 hours."
            : "Please wait a minute before sending another message.",
      },
      { status: 429 },
    )
  }

  const { error: insertError } = await supabase.from("ai_companion_usage").insert({ user_id: user.id })
  if (insertError) return dbErrorResponse(insertError, 500)

  try {
    const client = new Anthropic({ apiKey })
    const response = await client.beta.messages.create({
      model: COMPANION_MODEL,
      max_tokens: 2048, // short conversational replies; also a hard per-message cost cap
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: history,
      // On a safety-classifier decline, the API retries on a fallback model
      // chosen by refusal category. Fallback turns bill at that model's rates.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    })

    if (response.stop_reason === "refusal") {
      return NextResponse.json({
        reply: "I can't help with that one. If this is about someone's safety, please contact local emergency services or find a crisis line at https://findahelpline.com.",
      })
    }

    const reply = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim()

    return NextResponse.json({ reply: reply || "Sorry, I don't have an answer for that.", remainingToday: limit.remainingToday - 1 })
  } catch (err) {
    // Log the error class/status only -- never the conversation.
    if (err instanceof Anthropic.RateLimitError) {
      console.error("companion: provider rate limited")
      return NextResponse.json({ error: "The AI Companion is busy. Please try again shortly." }, { status: 503 })
    }
    console.error("companion: provider error", err instanceof Anthropic.APIError ? err.status : "network")
    return NextResponse.json({ error: "The AI Companion is unavailable right now." }, { status: 502 })
  }
}
