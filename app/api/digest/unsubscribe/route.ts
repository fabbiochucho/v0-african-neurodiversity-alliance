import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

// Token lookups must never come from Next's fetch cache.
export const dynamic = "force-dynamic"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function unsubscribe(request: Request): Promise<boolean> {
  const token = new URL(request.url).searchParams.get("token") ?? ""
  if (!UUID.test(token)) return false
  const { error } = await createServiceClient().from("digest_subscribers").delete().eq("token", token)
  return !error
}

// Link in the email footer.
export async function GET(request: Request) {
  const done = await unsubscribe(request)
  return NextResponse.redirect(new URL(`/news?digest=${done ? "unsubscribed" : "invalid"}`, request.url))
}

// One-click unsubscribe from mail clients (List-Unsubscribe-Post, RFC 8058).
export async function POST(request: Request) {
  const done = await unsubscribe(request)
  return new NextResponse(null, { status: done ? 200 : 400 })
}
