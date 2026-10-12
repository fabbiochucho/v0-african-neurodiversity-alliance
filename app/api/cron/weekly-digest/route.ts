import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { isCronRequest } from "@/lib/cron-auth"
import { appUrl, DIGEST_FROM, digestHtml, getResend, isDigestEmpty, type DigestContent } from "@/lib/digest"

export const dynamic = "force-dynamic"
export const maxDuration = 300

const BATCH_SIZE = 100 // Resend batch API limit

// Weekly (vercel.json). Skips the send entirely when nothing new came in.
export async function GET(request: Request) {
  if (!isCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const resend = getResend()
  if (!resend) return NextResponse.json({ skipped: "RESEND_API_KEY not set" })

  const supabase = createServiceClient()
  const since = new Date(Date.now() - 7 * 86400000).toISOString()

  const [news, research, resources, subscribers] = await Promise.all([
    supabase.from("news_items").select("title, url, source, country").eq("is_hidden", false).gte("created_at", since).order("published_at", { ascending: false }).limit(15),
    supabase.from("research_feed").select("title, url, journal, scope").eq("is_hidden", false).gte("created_at", since).order("scope").order("published_on", { ascending: false }).limit(10),
    supabase.from("resources").select("name, country, url").eq("is_published", true).gte("created_at", since).limit(10),
    supabase.from("digest_subscribers").select("email, token").not("confirmed_at", "is", null),
  ])
  if (news.error || research.error || resources.error || subscribers.error) {
    console.error("Digest query failed:", news.error ?? research.error ?? resources.error ?? subscribers.error)
    return NextResponse.json({ error: "Failed to build digest" }, { status: 500 })
  }

  const content: DigestContent = { news: news.data, research: research.data, resources: resources.data }
  if (isDigestEmpty(content)) return NextResponse.json({ skipped: "nothing new this week" })

  const base = appUrl()
  let sent = 0
  for (let i = 0; i < subscribers.data.length; i += BATCH_SIZE) {
    const batch = subscribers.data.slice(i, i + BATCH_SIZE).map((s) => {
      const unsubscribeUrl = `${base}/api/digest/unsubscribe?token=${s.token}`
      return {
        from: DIGEST_FROM,
        to: s.email,
        subject: "This week in neurodiversity · ANDA",
        html: digestHtml(content, unsubscribeUrl),
        headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      }
    })
    const { error } = await resend.batch.send(batch)
    if (error) console.error(`Digest batch ${i / BATCH_SIZE} failed:`, error)
    else sent += batch.length
  }

  return NextResponse.json({ sent, subscribers: subscribers.data.length })
}
