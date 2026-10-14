import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { isCronRequest } from "@/lib/cron-auth"
import { fetchNews, fetchResearch, RESEARCH_WINDOW_DAYS } from "@/lib/feeds"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Daily (vercel.json). New items publish immediately; existing rows are left
// alone (ignoreDuplicates) so an admin's "hide" is never undone.
export async function GET(request: Request) {
  if (!isCronRequest(request)) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
  }

  // Backfill research for a date range (same secret required):
  //   ?from=2022-01-01&to=2022-12-31&job=research
  // job=news or job=research runs just one half. Ranges are clamped to the
  // last 5 years.
  const params = new URL(request.url).searchParams
  const job = params.get("job")
  const range = parseRange(params.get("from"), params.get("to"))
  if (range === "invalid") {
    return NextResponse.json({ error: "Use from/to dates like 2022-01-01, within the last 5 years." }, { status: 400 })
  }
  const [news, research] = await Promise.all([
    job === "research" ? [] : fetchNews(),
    job === "news" ? [] : fetchResearch(range ?? undefined),
  ])

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

  return NextResponse.json({ news: news.length, research: research.length })
}

function parseRange(from: string | null, to: string | null) {
  if (!from && !to) return null
  const day = /^\d{4}-\d{2}-\d{2}$/
  const f = from && day.test(from) ? new Date(`${from}T00:00:00Z`) : null
  const t = to && day.test(to) ? new Date(`${to}T23:59:59Z`) : new Date()
  const earliest = new Date(Date.now() - RESEARCH_WINDOW_DAYS * 86400000)
  if (!f || isNaN(f.getTime()) || isNaN(t.getTime()) || f > t) return "invalid" as const
  return { from: f < earliest ? earliest : f, to: t }
}
