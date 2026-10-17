import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

// Token lookups must never come from Next's fetch cache.
export const dynamic = "force-dynamic"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? ""
  if (!UUID.test(token)) return NextResponse.redirect(new URL("/news?digest=invalid", request.url))

  const supabase = createServiceClient()
  const { data } = await supabase
    .from("digest_subscribers")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("token", token)
    .is("confirmed_at", null)
    .select("id")

  // A second click on an already-confirmed link still lands on "subscribed".
  if (!data?.length) {
    const { data: row } = await supabase.from("digest_subscribers").select("id").eq("token", token).maybeSingle()
    if (!row) return NextResponse.redirect(new URL("/news?digest=invalid", request.url))
  }
  return NextResponse.redirect(new URL("/news?digest=subscribed", request.url))
}
