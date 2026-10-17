import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Navigation } from "@/components/navigation"
import { DigestSignup } from "@/components/digest-signup"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, FlaskConical, Newspaper } from "lucide-react"
import { NEWS_WINDOW_DAYS, TOPICS } from "@/lib/feeds"

// Next 14 caches server-side fetches (including supabase-js reads) forever
// by default, so the first render's results stuck. Refresh every 5 minutes.
export const revalidate = 300

export const metadata = {
  title: "News & Research | ANDA",
  description: "Neurodiversity news from across Africa and new open-access research, updated daily.",
}

const DIGEST_MESSAGES: Record<string, string> = {
  subscribed: "You're subscribed. The digest arrives once a week.",
  unsubscribed: "You've been unsubscribed. You won't get any more digests.",
  invalid: "That link has expired or was already used.",
}

function formatDate(d: string | null) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default async function NewsPage(props: { searchParams: Promise<{ digest?: string; topic?: string }> }) {
  const searchParams = await props.searchParams;
  // Plain anon client (no cookies) so the page can be cached; RLS hides
  // anything an admin has hidden.
  const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const topic = TOPICS.some((t) => t.name === searchParams.topic) ? searchParams.topic! : null
  const research = (scope: "africa" | "global") => {
    const q = supabase.from("research_feed").select("id, title, url, journal, published_on, topics").eq("scope", scope)
    return (topic ? q.contains("topics", [topic]) : q).order("published_on", { ascending: false }).limit(20)
  }
  const [{ data: news }, { data: africa }, { data: global }] = await Promise.all([
    supabase
      .from("news_items")
      .select("id, title, url, source, country, published_at")
      .gte("published_at", new Date(Date.now() - NEWS_WINDOW_DAYS * 86400000).toISOString())
      .order("published_at", { ascending: false })
      .limit(60),
    research("africa"),
    research("global"),
  ])
  const digestMessage = searchParams.digest ? DIGEST_MESSAGES[searchParams.digest] : undefined

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <header className="max-w-3xl">
          <h1 className="text-4xl font-bold text-balance mb-3">News & Research</h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Neurodiversity news from across Africa and new open-access research, gathered automatically every day.
            Every item links to the original source.
          </p>
          {digestMessage && (
            <p role="status" className="mt-4 rounded-md bg-primary/10 px-4 py-3 text-sm">
              {digestMessage}
            </p>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section aria-labelledby="news-heading" className="space-y-4 min-w-0">
            <h2 id="news-heading" className="text-2xl font-semibold flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" /> News from across Africa
            </h2>
            {!news?.length ? (
              <p className="text-muted-foreground">No news yet. New stories appear here within a day of being published.</p>
            ) : (
              <ul className="divide-y rounded-lg border bg-card">
                {news.map((n) => (
                  <li key={n.id} className="p-4">
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary">
                      {n.title}
                      <ExternalLink className="inline h-3.5 w-3.5 ml-1 align-baseline" aria-hidden="true" />
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      {[n.source, n.country, formatDate(n.published_at)].filter(Boolean).join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">
              Includes headlines from{" "}
              <a href="https://allafrica.com/" target="_blank" rel="noopener noreferrer" className="underline">
                allAfrica.com
              </a>
              , MyJoyOnline, SABC News, Premium Times, Punch, Nation and Daily Maverick.
            </p>
          </section>

          <aside className="min-w-0">
            <Card>
              <CardContent className="p-6">
                <DigestSignup />
              </CardContent>
            </Card>
          </aside>
        </div>

        <section id="research" aria-labelledby="research-heading" className="space-y-6 scroll-mt-24">
          <h2 id="research-heading" className="text-2xl font-semibold flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" /> New open-access research
          </h2>
          <p className="text-muted-foreground max-w-3xl">
            Free-to-read papers on autism, ADHD, dyslexia, dyspraxia, dyscalculia, Tourette&apos;s and related conditions, from{" "}
            <a href="https://europepmc.org/" target="_blank" rel="noopener noreferrer" className="underline">
              Europe PMC
            </a>
            .
          </p>
          <nav aria-label="Filter research by topic" className="flex flex-wrap gap-2">
            {[null, ...TOPICS.map((t) => t.name)].map((name) => {
              const active = name === topic
              return (
                <a
                  key={name ?? "all"}
                  href={name ? `/news?topic=${encodeURIComponent(name)}#research` : "/news#research"}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full border px-3 py-1.5 text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary hover:text-primary"}`}
                >
                  {name ?? "All topics"}
                </a>
              )
            })}
          </nav>
          <p className="text-sm text-muted-foreground">
            Want the bigger picture first? Read{" "}
            <a href="/learning/what-works" className="underline">
              What works?
            </a>
            , our plain-language guide to the evidence. Or{" "}
            <a href="/news/research" className="underline">
              browse all research from the last 5 years
            </a>
            .
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { title: "By African researchers", badge: "African authors", rows: africa },
              { title: "Reviews and trials from around the world", badge: "Worldwide", rows: global },
            ].map((group) => (
              <Card key={group.title} className="min-w-0">
                <CardHeader>
                  <CardTitle className="text-lg">{group.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!group.rows?.length ? (
                    <p className="text-sm text-muted-foreground">
                      {topic ? `No ${topic.toLowerCase()} papers yet. Try another topic.` : "No new papers yet. Check back soon."}
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {group.rows.map((r) => (
                        <li key={r.id}>
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary">
                            {r.title}
                          </a>
                          <p className="text-sm text-muted-foreground mt-1">
                            {[r.journal, formatDate(r.published_on)].filter(Boolean).join(" · ")}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              Open access · {group.badge}
                            </Badge>
                            {r.topics?.map((t: string) => (
                              <Badge key={t} variant="secondary" className="text-xs">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
