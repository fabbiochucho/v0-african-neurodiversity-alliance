import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export interface SiteStats {
  organisations: number
  papers: number
  books: number
  apps: number
}

// Live counts for the home page, read with the public key (RLS decides what
// counts: published and not hidden). Returns null when the database can't be
// reached, so the page shows no numbers rather than wrong ones.
export async function getSiteStats(): Promise<SiteStats | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const db = createSupabaseClient(url, key)
  const count = async (q: PromiseLike<{ count: number | null; error: unknown }>) => {
    const { count, error } = await q
    if (error || count === null) throw new Error("count failed")
    return count
  }
  try {
    const [organisations, papers, books, apps] = await Promise.all([
      count(db.from("resources").select("id", { count: "exact", head: true }).eq("is_published", true)),
      count(db.from("research_feed").select("id", { count: "exact", head: true })),
      count(db.from("discovered_resources").select("id", { count: "exact", head: true }).in("kind", ["book", "story"])),
      count(db.from("discovered_resources").select("id", { count: "exact", head: true }).eq("kind", "app")),
    ])
    return { organisations, papers, books, apps }
  } catch {
    return null
  }
}
