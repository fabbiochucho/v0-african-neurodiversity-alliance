import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Public, unauthenticated resource directory feed. Intentionally has no auth
// check — directory data isn't personal, and RLS (resources_select_published)
// already restricts every caller (signed in or not) to published rows only.
// This is the read surface Neu Rafiki uses to show Alliance's directory.
//
// This route was measured hitting the database on every single request
// despite an `export const revalidate` — that export is silently ignored
// because lib/supabase/server.ts's createClient() calls cookies() (a
// dynamic API), which forces the whole route into fully dynamic rendering
// regardless of the revalidate value. This route never needs cookies/auth
// state at all (access control is entirely via RLS), so it uses a plain
// anon-key client instead, and wraps the actual query in unstable_cache so
// the underlying data fetch — not just the route shell — is genuinely
// cached for an hour per filter combination.
const getCachedResources = unstable_cache(
  async (country: string | null, category: string | null) => {
    const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    let query = supabase.from("resources").select("*").eq("is_published", true)
    if (country) query = query.eq("country", country)
    if (category) query = query.eq("category", category)

    const { data, error } = await query.order("rating", { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  },
  ["public-resources"],
  { revalidate: 3600 },
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country")
    const category = searchParams.get("category")

    const resources = await getCachedResources(country, category)

    // unstable_cache avoids re-querying Supabase on a cache hit, but the HTTP
    // response itself still needs an explicit Cache-Control header for
    // Vercel's edge network to actually serve repeat requests without
    // invoking this function at all (confirmed via X-Vercel-Cache: MISS on
    // every request before this was added). s-maxage is what Vercel's CDN
    // honors; stale-while-revalidate lets it keep serving the last-known-good
    // response instantly while refreshing in the background after expiry,
    // so a cache refresh never blocks a real visitor.
    return NextResponse.json(
      { resources },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
