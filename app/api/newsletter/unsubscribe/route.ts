import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

// Token lookups must never come from Next's fetch cache.
export const dynamic = "force-dynamic"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Keeps the row (it's the consent record) and marks it unsubscribed.
async function unsubscribe(request: Request): Promise<boolean> {
  const token = new URL(request.url).searchParams.get("token") ?? ""
  if (!UUID.test(token)) return false
  const service = createServiceClient()
  const { data: row } = await service.from("newsletter_subscribers").select("unsubscribed_at").eq("token", token).maybeSingle()
  if (!row) return false
  if (row.unsubscribed_at) return true // already unsubscribed: keep the original date
  const { error } = await service
    .from("newsletter_subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("token", token)
  return !error
}

// Link in the email footer.
export async function GET(request: Request) {
  const done = await unsubscribe(request)
  return NextResponse.redirect(new URL(`/newsletter?status=${done ? "unsubscribed" : "invalid"}`, request.url))
}

// One-click unsubscribe from mail clients (List-Unsubscribe-Post, RFC 8058).
export async function POST(request: Request) {
  const done = await unsubscribe(request)
  return new NextResponse(null, { status: done ? 200 : 400 })
}
