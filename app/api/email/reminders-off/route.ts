import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

// Token lookups must never come from Next's fetch cache.
export const dynamic = "force-dynamic"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function turnOff(request: Request): Promise<boolean> {
  const token = new URL(request.url).searchParams.get("token") ?? ""
  if (!UUID.test(token)) return false
  const { data, error } = await createServiceClient()
    .from("email_lifecycle")
    .update({ reminders_off_at: new Date().toISOString() })
    .eq("token", token)
    .select("user_id")
  return !error && (data?.length ?? 0) > 0
}

const page = (message: string) =>
  new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ANDA email settings</title></head><body style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:48px auto;padding:0 16px;color:#1e2a27"><h1 style="font-size:22px">${message}</h1><p>You can turn them back on in <a href="/account/privacy" style="color:#2A7A69">Privacy and your data</a>.</p><p><a href="/dashboard" style="color:#2A7A69">Back to ANDA</a></p></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  )

// Link in the email footer.
export async function GET(request: Request) {
  return page((await turnOff(request)) ? "You won't get check-in reminders any more." : "That link isn't valid any more.")
}

// One-click unsubscribe from mail clients (List-Unsubscribe-Post, RFC 8058).
export async function POST(request: Request) {
  return new NextResponse(null, { status: (await turnOff(request)) ? 200 : 400 })
}
