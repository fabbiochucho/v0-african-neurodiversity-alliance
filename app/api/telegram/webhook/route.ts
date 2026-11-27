import { NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { createServiceClient } from "@/lib/supabase/service"
import { CRISIS_RESPONSE, detectCrisis } from "@/lib/companion"
import { findReviewedAnswers, MAX_QUESTION_CHARS } from "@/lib/reviewed-answers"
import { queueExpertQuestion } from "@/lib/expert-queue"
import { answerMessage, EXPERT_BUTTON, HELP, LINK_FIRST, linkCodeHash, parseCommand, parseFeedback, sendTelegram, telegramApi } from "@/lib/telegram"

// POST /api/telegram/webhook  Telegram updates, checked against TELEGRAM_WEBHOOK_SECRET.
// No AI: replies are reviewed answers, the crisis reply, or (later) an expert's answer.

function secretMatches(given: string | null): boolean {
  const want = process.env.TELEGRAM_WEBHOOK_SECRET ?? ""
  if (!want || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(want)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function onMessage(chatId: string, text: string) {
  const db = createServiceClient()
  const cmd = parseCommand(text)
  const { data: link } = await db.from("telegram_links").select("user_id").eq("chat_id", chatId).maybeSingle()

  if (cmd.name === "start" && cmd.arg) {
    const { data: code } = await db
      .from("telegram_link_codes")
      .delete()
      .eq("code_hash", linkCodeHash(cmd.arg))
      .gt("expires_at", new Date().toISOString())
      .select("user_id")
      .maybeSingle()
    if (!code) return sendTelegram(chatId, "That link has expired or was already used. On ANDA, open Your account and choose \"Link Telegram\" again.")
    await db.from("telegram_links").upsert({ chat_id: chatId, user_id: code.user_id, pending_question: null, linked_at: new Date().toISOString() })
    return sendTelegram(chatId, `Linked to your ANDA account. Expert replies will come here too.\n\n${HELP}`)
  }
  if (cmd.name === "start" || cmd.name === "help") return sendTelegram(chatId, HELP)
  if (cmd.name === "stop") {
    if (!link) return sendTelegram(chatId, "This chat isn't linked to an ANDA account.")
    await db.from("telegram_links").delete().eq("chat_id", chatId)
    return sendTelegram(chatId, "Unlinked. ANDA won't send anything more to this chat. You can still type questions to search the reviewed answers.")
  }
  if (cmd.name === "mine") {
    if (!link) return sendTelegram(chatId, LINK_FIRST)
    const { data: qs } = await db
      .from("expert_questions")
      .select("status")
      .eq("user_id", link.user_id)
      .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    const open = (qs ?? []).filter((q) => q.status === "open").length
    const answered = (qs ?? []).filter((q) => q.status === "answered").length
    return sendTelegram(chatId, `In the last 90 days: ${open} waiting for an expert, ${answered} answered. Read all replies on ANDA under Ask a question → Your questions.`)
  }

  // A question. The crisis screen comes before anything else.
  const question = cmd.arg.slice(0, MAX_QUESTION_CHARS)
  if (question.length < 3) return sendTelegram(chatId, HELP)
  if (detectCrisis(question)) return sendTelegram(chatId, CRISIS_RESPONSE)
  const answers = await findReviewedAnswers(db, question, 2)
  for (const a of answers) {
    const m = answerMessage(a)
    await sendTelegram(chatId, m.text, m.buttons)
  }
  if (!link) {
    return sendTelegram(chatId, answers.length ? `Not what you needed? ${LINK_FIRST}` : `No reviewed answer covers this yet. ${LINK_FIRST}`)
  }
  await db.from("telegram_links").update({ pending_question: question }).eq("chat_id", chatId)
  return sendTelegram(chatId, answers.length ? "Not what you needed?" : "No reviewed answer covers this yet.", EXPERT_BUTTON)
}

async function onButton(chatId: string, callbackId: string, data: string) {
  await telegramApi("answerCallbackQuery", { callback_query_id: callbackId })
  const db = createServiceClient()
  const feedback = parseFeedback(data)
  if (feedback) {
    await db.rpc("rate_reviewed_answer", { answer_id: feedback.id, was_helpful: feedback.helpful })
    return sendTelegram(chatId, "Thank you.")
  }
  if (data !== "e") return
  const { data: link } = await db.from("telegram_links").select("user_id, pending_question").eq("chat_id", chatId).maybeSingle()
  if (!link) return sendTelegram(chatId, LINK_FIRST)
  if (!link.pending_question) return sendTelegram(chatId, "Type your question first, then press the button.")
  const result = await queueExpertQuestion(link.user_id, link.pending_question, "telegram")
  if (!result.ok) return sendTelegram(chatId, result.error)
  await db.from("telegram_links").update({ pending_question: null }).eq("chat_id", chatId)
  return sendTelegram(chatId, "Sent. An ANDA expert will reply here, usually within a few working days.")
}

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return new NextResponse("Forbidden", { status: 403 })
  }
  try {
    const update = await request.json()
    const message = update?.message
    const callback = update?.callback_query
    // Private chats only: in a group, other members would see questions and answers.
    if (message?.chat?.type === "private" && typeof message.text === "string") {
      await onMessage(String(message.chat.id), message.text)
    } else if (callback?.message?.chat?.type === "private") {
      await onButton(String(callback.message.chat.id), String(callback.id), String(callback.data ?? ""))
    }
  } catch {
    console.error("telegram update failed")
  }
  // Always 200 once the secret matches: otherwise Telegram retries the same update.
  return new NextResponse("ok")
}
