import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { FEATURES, isEnabled, isFeatureKey } from "@/lib/features"

export const dynamic = "force-dynamic"

// GET /api/features?keys=community.posting -> { "community.posting": true }
// For pages that render in the browser and need to hide something that's switched off.
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const keys = (new URL(request.url).searchParams.get("keys") ?? "").split(",").filter(isFeatureKey)
  const out: Partial<Record<keyof typeof FEATURES, boolean>> = {}
  for (const k of keys) out[k] = await isEnabled(k, { userId: user?.id ?? null })
  return NextResponse.json(out, { headers: { "Cache-Control": "private, no-store" } })
}
