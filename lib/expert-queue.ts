// Server-only: questions for an ANDA expert (scripts/061). Shared by /api/ask and Telegram.
import { createServiceClient } from "@/lib/supabase/service"
import { detectCrisis } from "@/lib/companion"
import { answeredEmail, MAX_OPEN_QUESTIONS, MAX_QUESTION_CHARS } from "@/lib/reviewed-answers"
import { sendInviteEmail } from "@/lib/support-team-invite"
import { appUrl } from "@/lib/app-url"
import { sendTelegram, telegramConfigured } from "@/lib/telegram"

export type QueueResult = { ok: true; crisis: boolean } | { ok: false; error: string; status: number }

export async function queueExpertQuestion(
  userId: string,
  raw: unknown,
  channel: "web" | "telegram" = "web",
): Promise<QueueResult> {
  const question = typeof raw === "string" ? raw.trim() : ""
  if (question.length < 5 || question.length > MAX_QUESTION_CHARS) {
    return { ok: false, error: `Please write between 5 and ${MAX_QUESTION_CHARS} characters.`, status: 400 }
  }
  const db = createServiceClient()
  const { count, error: countError } = await db
    .from("expert_questions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "open")
  if (countError) return { ok: false, error: "Questions are unavailable right now.", status: 500 }
  if ((count ?? 0) >= MAX_OPEN_QUESTIONS) {
    return {
      ok: false,
      error: `You already have ${MAX_OPEN_QUESTIONS} questions waiting for an expert. You can send another once one is answered.`,
      status: 429,
    }
  }
  const crisis = detectCrisis(question)
  const { error } = await db.from("expert_questions").insert({ user_id: userId, question, channel, crisis })
  if (error) return { ok: false, error: "Questions are unavailable right now.", status: 500 }
  return { ok: true, crisis }
}

/**
 * Tell the person their question has a reply: by email, and in any linked Telegram chat. A question
 * asked on Telegram gets the reply there in full; otherwise Telegram gets a notice only, so text
 * written on the website doesn't travel through Telegram. Never throws; the reply is saved either way.
 */
export async function notifyAnswered(question: { user_id: string; channel: string }, reply: string): Promise<void> {
  const db = createServiceClient()
  try {
    const { data } = await db.auth.admin.getUserById(question.user_id)
    const email = data.user?.email
    if (email) await sendInviteEmail(email, answeredEmail(`${appUrl()}/ask/mine`))
  } catch {
    console.error("answer email failed")
  }
  if (!telegramConfigured()) return
  const { data: chats } = await db.from("telegram_links").select("chat_id").eq("user_id", question.user_id)
  const text =
    question.channel === "telegram"
      ? `An ANDA expert replied to your question:

${reply}

General guidance, not a diagnosis.`
      : "An ANDA expert has replied to the question you sent on the website. Sign in to ANDA to read it (Ask a question → Your questions)."
  await Promise.all((chats ?? []).map((c) => sendTelegram(c.chat_id, text)))
}
