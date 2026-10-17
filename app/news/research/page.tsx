import Link from "next/link"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Navigation } from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RESEARCH_WINDOW_DAYS, TOPICS } from "@/lib/feeds"

// Feed tables change once a day; refresh at most every 5 minutes (Next 14
// otherwise caches supabase-js fetches forever, see /news).
export const revalidate = 300

export const metadata = {
  title: "Research Library | ANDA",
  description: "Open-access research on autism, ADHD, dyslexia and related conditions from the last 5 years.",
}

const PAGE_SIZE = 30

type Params = { q?: string; scope?: string; topic?: string; year?: string; page?: string }

function formatDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""
}

export default async function ResearchLibraryPage(props: { searchParams: Promise<Params> }) {
  const searchParams = await props.searchParams;
  const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const thisYear = new Date().getUTCFullYear()
  const years = Array.from({ length: Math.ceil(RESEARCH_WINDOW_DAYS / 365) + 1 }, (_, i) => thisYear - i)
  const q = (searchParams.q ?? "").trim().slice(0, 100)
  const scope = searchParams.scope === "africa" || searchParams.scope === "global" ? searchParams.scope : null
  const topic = TOPICS.some((t) => t.name === searchParams.topic) ? searchParams.topic! : null
  const year = years.includes(Number(searchParams.year)) ? Number(searchParams.year) : null
  const page = Math.max(1, Math.min(Number(searchParams.page) || 1, 500))

  let query = supabase
    .from("research_feed")
    .select("id, title, url, authors, journal, published_on, scope, topics", { count: "exact" })
  if (q) query = query.ilike("title", `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`)
  if (scope) query = query.eq("scope", scope)
  if (topic) query = query.contains("topics", [topic])
  if (year) query = query.gte("published_on", `${year}-01-01`).lte("published_on", `${year}-12-31`)
  const { data: papers, count, error } = await query
    .order("published_on", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const total = count ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const link = (changes: Partial<Params>) => {
    const next = { q: q || undefined, scope: scope ?? undefined, topic: topic ?? undefined, year: year ? String(year) : undefined, ...changes }
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][])
    const s = qs.toString()
    return s ? `/news/research?${s}` : "/news/research"
  }

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary hover:text-primary"}`

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">News &amp; Research</p>
          <h1 className="text-4xl font-bold text-balance mb-3">Research library</h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Free-to-read papers from the last 5 years on autism, ADHD, dyslexia, dyspraxia, dyscalculia, Tourette&apos;s and
            related conditions: everything with African-affiliated authors, plus reviews and trials on everyday topics from
            around the world. New papers are added daily from{" "}
            <a href="https://europepmc.org/" target="_blank" rel="noopener noreferrer" className="underline">
              Europe PMC
            </a>
            .
          </p>
        </header>

        <form action="/news/research" className="flex flex-col sm:flex-row gap-2 max-w-2xl" role="search">
          {scope && <input type="hidden" name="scope" value={scope} />}
          {topic && <input type="hidden" name="topic" value={topic} />}
          {year && <input type="hidden" name="year" value={year} />}
          <label htmlFor="research-q" className="sr-only">
            Search paper titles
          </label>
          <Input id="research-q" name="q" defaultValue={q} placeholder="Search paper titles, e.g. sleep, school, Nigeria" />
          <Button type="submit">Search</Button>
        </form>

        <div className="space-y-3">
          <nav aria-label="Filter by authors" className="flex flex-wrap gap-2">
            {[
              { v: null, label: "All papers" },
              { v: "africa", label: "African authors" },
              { v: "global", label: "Worldwide reviews & trials" },
            ].map((o) => (
              <a key={o.label} href={link({ scope: o.v ?? undefined, page: undefined })} aria-current={scope === o.v ? "page" : undefined} className={chip(scope === o.v)}>
                {o.label}
              </a>
            ))}
          </nav>
          <nav aria-label="Filter by topic" className="flex flex-wrap gap-2">
            {[null, ...TOPICS.map((t) => t.name)].map((name) => (
              <a key={name ?? "all"} href={link({ topic: name ?? undefined, page: undefined })} aria-current={topic === name ? "page" : undefined} className={chip(topic === name)}>
                {name ?? "All topics"}
              </a>
            ))}
          </nav>
          <nav aria-label="Filter by year" className="flex flex-wrap gap-2">
            {[null, ...years].map((y) => (
              <a key={y ?? "all"} href={link({ year: y ? String(y) : undefined, page: undefined })} aria-current={year === y ? "page" : undefined} className={chip(year === y)}>
                {y ?? "All years"}
              </a>
            ))}
          </nav>
        </div>

        {error ? (
          <p className="rounded-md bg-muted p-4">The research library didn&apos;t load. Please try again in a moment.</p>
        ) : !papers?.length ? (
          <div className="rounded-lg border p-8 text-center space-y-3">
            <p className="font-medium">No papers match these filters.</p>
            <Button variant="outline" asChild>
              <Link href="/news/research">Clear filters</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {total.toLocaleString("en-GB")} paper{total === 1 ? "" : "s"} · page {page} of {pages}
            </p>
            <ul className="divide-y rounded-lg border bg-card">
              {papers.map((r) => (
                <li key={r.id} className="p-4">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary break-words">
                    {r.title}
                  </a>
                  <p className="text-sm text-muted-foreground mt-1 break-words">
                    {[r.authors, r.journal, formatDate(r.published_on)].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      Open access · {r.scope === "africa" ? "African authors" : "Worldwide"}
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
            <nav aria-label="Pages" className="flex items-center justify-between gap-4">
              {page > 1 ? (
                <Button variant="outline" asChild>
                  <a href={link({ page: String(page - 1) })}>Previous</a>
                </Button>
              ) : (
                <span />
              )}
              {page < pages && (
                <Button variant="outline" asChild>
                  <a href={link({ page: String(page + 1) })}>Next</a>
                </Button>
              )}
            </nav>
          </>
        )}
      </div>
    </div>
  )
}
