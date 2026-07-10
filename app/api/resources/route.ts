import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Public, unauthenticated resource directory feed. Intentionally has no auth
// check — directory data isn't personal, and RLS (resources_select_published)
// already restricts every caller (signed in or not) to published rows only.
// This is the read surface Neu Rafiki uses to show Alliance's directory.
//
// Cached for an hour: this data is admin-managed and changes rarely, and
// this route was measured hitting the database on every single request with
// no caching at all (consistently the slowest endpoint on the site).
export const revalidate = 3600

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country")
    const category = searchParams.get("category")

    const supabase = await createClient()

    let query = supabase.from("resources").select("*").eq("is_published", true)

    if (country) query = query.eq("country", country)
    if (category) query = query.eq("category", category)

    const { data, error } = await query.order("rating", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ resources: data ?? [] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
