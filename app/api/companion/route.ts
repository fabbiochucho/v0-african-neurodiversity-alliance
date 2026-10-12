import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse, upgradeRequiredResponse } from "@/lib/api-error"
import { AI_DAILY_MESSAGES, FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import {
  buildLearnerContext,
  checkRateLimit,
  companionModel,
  CRISIS_RESPONSE,
  detectCrisis,
  hasActiveConsent,
  sanitizeHistory,
  SYSTEM_PROMPT,
} from "@/lib/companion"

// POST /api/companion  { messages: [{ role, content }, ...], learner_id?: string }
//
// Free-text chat (Pro and above). Stateless by design: the browser holds the
// conversation, and nothing about its content is stored or logged here. Only
// (user_id, created_at) is recorded, for rate limiting. Learner data is
// added only when the owner has an active consent for that learner.
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "AI chat isn't configured yet." }, { status: 503 })
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
    return upgradeRequiredResponse("AI chat is part of the Pro plan.", FEATURE_MIN_TIER.ai_companion)
  }

  const body = await request.json().catch(() => null)
  const history = sanitizeHistory(body?.messages)
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
            ? "You've reached today's AI chat limit. It resets over the next 24 hours."
            : "Please wait a minute before sending another message.",
      },
      { status: 429 },
    )
  }

  // Learner context: only with an active, current-version consent, checked
  // on every message so a withdrawal applies immediately.
  let learnerContext: string | null = null
  if (typeof body?.learner_id === "string") {
    const [{ data: events }, { data: learner }] = await Promise.all([
      supabase
        .from("ai_learner_consent_events")
        .select("action, consent_version, created_at")
        .eq("learner_id", body.learner_id)
        .eq("user_id", user.id),
      supabase.from("learner_profiles").select("id, name").eq("id", body.learner_id).eq("user_id", user.id).maybeSingle(),
    ])
    if (learner && hasActiveConsent(events ?? [])) {
      const { data: ieps } = await supabase
        .from("ieps")
        .select("iep_goals(goal_text, domain, status, progress_logs(rating, logged_date))")
        .eq("learner_id", learner.id)
      const goals = (ieps ?? []).flatMap((i) => (i.iep_goals ?? []) as Parameters<typeof buildLearnerContext>[1])
      learnerContext = buildLearnerContext(learner.name, goals)
    }
  }

  const { error: insertError } = await supabase.from("ai_companion_usage").insert({ user_id: user.id })
  if (insertError) return dbErrorResponse(insertError, 500)

  try {
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: companionModel(),
      max_tokens: 2048, // short conversational replies; also a hard per-message cost cap
      output_config: { effort: "low" },
      system: learnerContext ? `${SYSTEM_PROMPT}\n\n${learnerContext}` : SYSTEM_PROMPT,
      messages: history,
    })

    if (response.stop_reason === "refusal") {
      return NextResponse.json({
        reply:
          "I can't help with that one. If this is about someone's safety, please contact local emergency services or find a crisis line at https://findahelpline.com.",
      })
    }

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim()

    return NextResponse.json({
      reply: reply || "Sorry, I don't have an answer for that.",
      remainingToday: limit.remainingToday - 1,
      usedLearnerData: Boolean(learnerContext),
    })
  } catch (err) {
    // Log the error class/status only -- never the conversation.
    if (err instanceof Anthropic.RateLimitError) {
      console.error("companion: provider rate limited")
      return NextResponse.json({ error: "AI chat is busy. Please try again shortly." }, { status: 503 })
    }
    console.error("companion: provider error", err instanceof Anthropic.APIError ? err.status : "network")
    return NextResponse.json({ error: "AI chat is unavailable right now." }, { status: 502 })
  }
}
