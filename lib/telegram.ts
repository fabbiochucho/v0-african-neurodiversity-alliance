// ANDA on Telegram (docs/TELEGRAM.md): reviewed answers and questions for an expert, as short
// text messages with buttons, for people on a phone and a slow connection. No AI is used here:
// replies are approved answers, the crisis reply, or an expert's answer.
// Pure helpers first (unit tested), then the Bot API calls. TELEGRAM_BOT_TOKEN unset = off.
import { createHash } from "node:crypto"
import { DIAGNOSIS_NOTE, reviewLabel, type ReviewedAnswer } from "@/lib/reviewed-answers"

export type Command = { name: "start" | "ask" | "mine" | "stop" | "help"; arg: string }

/** "/ask@anda_bot how…" → ask; plain text is a question; unknown commands get the help. */
export function parseCommand(text: string): Command {
  const m = /^\/(\w+)(?:@\w+)?\s*([\s\S]*)$/.exec(text.trim())
  if (!m) return { name: "ask", arg: text.trim() }
  const name = m[1].toLowerCase()
  return ["start", "ask", "mine", "stop", "help"].includes(name)
    ? { name: name as Command["name"], arg: m[2].trim() }
    : { name: "help", arg: "" }
}

export const HELP = [
  "ANDA (African Neurodiversity Alliance) on Telegram.",
  "",
  "Type a question, for example: How can we make bedtime calmer?",
  "You'll get answers ANDA wrote from WHO guidance and research and checked against their sources. If none covers it, you can send it to ANDA.",
  "",
  "/mine your questions for an expert",
  "/stop unlink this chat from your ANDA account",
  "",
  "General guidance, not a diagnosis. Please don't send names or health records.",
].join("\n")

export const LINK_FIRST =
  "To send a question to an ANDA expert, first link this chat: sign in at ANDA, open Your account, choose \"Link Telegram\" and follow the link."

/** Link codes are stored only as this hash. */
export const linkCodeHash = (code: string) => createHash("sha256").update(code.trim().toUpperCase()).digest("hex")

export interface Button {
  text: string
  callback_data: string
}

/** Telegram caps a message at 4096 characters; cut cleanly well before that. */
export const clip = (text: string, max = 3500) => (text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`)

export function answerMessage(a: ReviewedAnswer): { text: string; buttons: Button[][] } {
  return {
    // The answer is clipped first so the label and the diagnosis note always fit.
    text: `ANDA reviewed answer: ${a.question}\n\n${clip(a.answer, 2400)}${a.sources ? `\n\nSources: ${clip(a.sources, 500)}` : ""}\n\n${reviewLabel(a)}\n${DIAGNOSIS_NOTE}`,
    // callback_data is limited to 64 bytes: "f:" + uuid + ":1" is 40.
    buttons: [[{ text: "This helped", callback_data: `f:${a.id}:1` }, { text: "It didn't help", callback_data: `f:${a.id}:0` }]],
  }
}

export const EXPERT_BUTTON: Button[][] = [[{ text: "Send to an ANDA expert", callback_data: "e" }]]

/** "f:<uuid>:1" → { id, helpful }, or null. */
export function parseFeedback(data: string): { id: string; helpful: boolean } | null {
  const m = /^f:([0-9a-f-]{36}):([01])$/i.exec(data)
  return m ? { id: m[1], helpful: m[2] === "1" } : null
}

export const telegramConfigured = () => Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim())

export async function telegramApi(method: string, body: unknown): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  if (!token) return false
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) console.error("telegram", method, res.status)
    return res.ok
  } catch {
    console.error("telegram", method, "failed")
    return false
  }
}

export const sendTelegram = (chatId: string, text: string, buttons?: Button[][]) =>
  telegramApi("sendMessage", {
    chat_id: chatId,
    text: clip(text),
    disable_web_page_preview: true, // saves data on slow connections
    ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
  })
