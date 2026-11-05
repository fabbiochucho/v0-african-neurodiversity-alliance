import Link from "next/link"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CONTENT_KINDS, isContentKind } from "@/lib/content"

// Posts written on /admin/content. Refreshed when staff publish, and every 5 minutes.
export const revalidate = 300
export const metadata = {
  title: "Blog, news and training | ANDA",
  description: "Articles, news, training and announcements from the African Neurodiversity Alliance.",
}

const date = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "")

export default async function BlogPage(props: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await props.searchParams
  // Plain anon client: RLS shows published posts only.
  const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  let q = supabase
    .from("content_items")
    .select("id, kind, slug, title, summary, cover_image_url, published_at")
    .order("published_at", { ascending: false })
    .limit(60)
  if (isContentKind(kind)) q = q.eq("kind", kind)
  const { data: posts } = await q

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-bold">Blog, news and training</h1>
          <p className="text-lg text-muted-foreground">From the ANDA team.</p>
        </header>
        <nav aria-label="Filter posts" className="flex flex-wrap gap-2 text-sm">
          <Link href="/blog" aria-current={!isContentKind(kind) ? "page" : undefined} className={`rounded-full px-4 py-1.5 ${!isContentKind(kind) ? "bg-primary text-primary-foreground" : "border"}`}>All</Link>
          {Object.entries(CONTENT_KINDS).map(([v, l]) => (
            <Link key={v} href={`/blog?kind=${v}`} aria-current={kind === v ? "page" : undefined} className={`rounded-full px-4 py-1.5 ${kind === v ? "bg-primary text-primary-foreground" : "border"}`}>{l}</Link>
          ))}
        </nav>
        {!posts?.length ? (
          <p className="text-muted-foreground">Nothing here yet.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/blog/${p.slug}`} className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-primary">
                  <Card className="h-full overflow-hidden hover:border-primary">
                    {p.cover_image_url && (
                      // eslint-disable-next-line @next/next/no-img-element -- images are unoptimised site-wide
                      <img src={p.cover_image_url} alt="" className="w-full aspect-[16/9] object-cover" loading="lazy" />
                    )}
                    <CardHeader>
                      <p className="text-xs uppercase tracking-wide text-primary">{CONTENT_KINDS[p.kind as keyof typeof CONTENT_KINDS]} · {date(p.published_at)}</p>
                      <CardTitle className="text-lg">{p.title}</CardTitle>
                    </CardHeader>
                    {p.summary && <CardContent className="text-sm text-muted-foreground">{p.summary}</CardContent>}
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
