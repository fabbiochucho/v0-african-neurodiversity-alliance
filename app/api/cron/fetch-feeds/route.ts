import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { isCronRequest } from "@/lib/cron-auth"
import { fetchAllAfricaNews, fetchGdeltNews, fetchResearch } from "@/lib/feeds"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Daily (vercel.json). New items publish immediately; existing rows are left
// alone (ignoreDuplicates) so an admin's "hide" is never undone.
export async function GET(request: Request) {
  if (!isCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ?days=90 backfills research on the first run (same secret required).
  const days = Math.min(Math.max(Number(new URL(request.url).searchParams.get("days")) || 7, 1), 365)
  const [allAfrica, gdelt, research] = await Promise.all([fetchAllAfricaNews(), fetchGdeltNews(), fetchResearch(days)])
  const news = [...allAfrica, ...gdelt]

  const supabase = createServiceClient()
  const [newsResult, researchResult] = await Promise.all([
    news.length
      ? supabase.from("news_items").upsert(news, { onConflict: "url", ignoreDuplicates: true })
      : Promise.resolve({ error: null }),
    research.length
      ? supabase.from("research_feed").upsert(research, { onConflict: "url", ignoreDuplicates: true })
      : Promise.resolve({ error: null }),
  ])

  if (newsResult.error || researchResult.error) {
    console.error("Feed upsert failed:", newsResult.error ?? researchResult.error)
    return NextResponse.json({ error: "Failed to save feed items" }, { status: 500 })
  }

  return NextResponse.json({ news: { allAfrica: allAfrica.length, gdelt: gdelt.length }, research: research.length })
}
