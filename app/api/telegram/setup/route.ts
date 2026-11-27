import { NextResponse } from "next/server"
import { staffForApi } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"
import { appUrl } from "@/lib/app-url"
import { telegramApi } from "@/lib/telegram"

// POST /api/telegram/setup  Point the bot's webhook at this site (docs/TELEGRAM.md, step 3).
export async function POST() {
  const staff = await staffForApi("features.edit")
  if (staff instanceof NextResponse) return staff
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()
  if (!secret) return NextResponse.json({ error: "Set TELEGRAM_WEBHOOK_SECRET first." }, { status: 400 })
  const ok =
    (await telegramApi("setWebhook", {
      url: `${appUrl()}/api/telegram/webhook`,
      secret_token: secret,
      allowed_updates: ["message", "callback_query"],
    })) &&
    (await telegramApi("setMyCommands", {
      commands: [
        { command: "mine", description: "Your questions for an expert" },
        { command: "help", description: "How this works" },
        { command: "stop", description: "Unlink this chat" },
      ],
    }))
  if (ok) await logAdminAction(staff, "telegram.setup", { type: "telegram", after: { webhook: `${appUrl()}/api/telegram/webhook` } })
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 })
}
