import { NextResponse } from "next/server"
import { randomBytes } from "node:crypto"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { linkCodeHash, telegramConfigured } from "@/lib/telegram"

// GET    is this account linked to a Telegram chat?
// POST   a one-time link (valid 15 minutes) that opens the bot and links the chat
// DELETE unlink every chat
const CODE_MINUTES = 15
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } })

async function userId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function GET() {
  const uid = await userId()
  if (!uid) return json({ error: "Please sign in again." }, 401)
  const { count } = await createServiceClient().from("telegram_links").select("chat_id", { count: "exact", head: true }).eq("user_id", uid)
  return json({ configured: telegramConfigured() && Boolean(process.env.TELEGRAM_BOT_USERNAME), linked: count ?? 0 })
}

export async function POST() {
  const uid = await userId()
  if (!uid) return json({ error: "Please sign in again." }, 401)
  const bot = process.env.TELEGRAM_BOT_USERNAME?.trim()
  if (!telegramConfigured() || !bot) return json({ error: "Telegram isn't switched on yet." }, 503)
  const db = createServiceClient()
  await db.from("telegram_link_codes").delete().lt("expires_at", new Date().toISOString())
  await db.from("telegram_link_codes").delete().eq("user_id", uid) // one live code per person
  const code = randomBytes(8).toString("hex").toUpperCase()
  const { error } = await db
    .from("telegram_link_codes")
    .insert({ code_hash: linkCodeHash(code), user_id: uid, expires_at: new Date(Date.now() + CODE_MINUTES * 60_000).toISOString() })
  if (error) return json({ error: "Linking is unavailable right now." }, 500)
  return json({ url: `https://t.me/${bot}?start=${code}`, minutes: CODE_MINUTES })
}

export async function DELETE() {
  const uid = await userId()
  if (!uid) return json({ error: "Please sign in again." }, 401)
  await createServiceClient().from("telegram_links").delete().eq("user_id", uid)
  return json({ ok: true })
}
