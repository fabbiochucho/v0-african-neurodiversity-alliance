import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createServiceClient } from "@/lib/supabase/service"
import { getAdminEmail } from "@/lib/admin"

export const dynamic = "force-dynamic"
export const metadata = { title: "Moderate feeds | ANDA", robots: { index: false } }

const TABLES = { news: "news_items", research: "research_feed" } as const

async function setHidden(formData: FormData) {
  "use server"
  if (!(await getAdminEmail())) return
  const table = TABLES[formData.get("table") as keyof typeof TABLES]
  const id = String(formData.get("id") ?? "")
  if (!table || !id) return
  await createServiceClient()
    .from(table)
    .update({ is_hidden: formData.get("hidden") === "true" })
    .eq("id", id)
  revalidatePath("/admin/feeds")
  revalidatePath("/news")
}

type Row = { id: string; title: string; url: string; is_hidden: boolean; meta: string }

function ItemList({ table, rows }: { table: keyof typeof TABLES; rows: Row[] }) {
  if (!rows.length) return <p className="text-muted-foreground">Nothing fetched yet.</p>
  return (
    <ul className="divide-y rounded-lg border bg-card">
      {rows.map((r) => (
        <li key={r.id} className={`p-4 flex flex-col sm:flex-row sm:items-start gap-3 ${r.is_hidden ? "opacity-60" : ""}`}>
          <div className="flex-1 min-w-0">
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary break-words">
              {r.title}
            </a>
            <p className="text-sm text-muted-foreground">{r.meta}</p>
          </div>
          <form action={setHidden} className="flex items-center gap-2 shrink-0">
            {r.is_hidden && <Badge variant="secondary">Hidden</Badge>}
            <input type="hidden" name="table" value={table} />
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="hidden" value={String(!r.is_hidden)} />
            <Button type="submit" size="sm" variant={r.is_hidden ? "outline" : "secondary"}>
              {r.is_hidden ? "Show" : "Hide"}
            </Button>
          </form>
        </li>
      ))}
    </ul>
  )
}

export default async function AdminFeedsPage() {
  if (!(await getAdminEmail())) notFound()

  const supabase = createServiceClient()
  const [{ data: news }, { data: research }] = await Promise.all([
    supabase.from("news_items").select("id, title, url, source, country, is_hidden, created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("research_feed").select("id, title, url, journal, scope, is_hidden, created_at").order("created_at", { ascending: false }).limit(100),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <header>
          <h1 className="text-3xl font-bold mb-2">Moderate news & research</h1>
          <p className="text-muted-foreground">
            New items go live on /news as soon as they&apos;re fetched. Hide anything off-topic; hidden items also stay out of the
            weekly digest.
          </p>
        </header>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">News (latest 100)</h2>
          <ItemList
            table="news"
            rows={(news ?? []).map((n) => ({ ...n, meta: [n.source, n.country].filter(Boolean).join(" · ") }))}
          />
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Research (latest 100)</h2>
          <ItemList
            table="research"
            rows={(research ?? []).map((r) => ({
              ...r,
              meta: [r.journal, r.scope === "africa" ? "African authors" : "Worldwide"].filter(Boolean).join(" · "),
            }))}
          />
        </section>
      </div>
    </div>
  )
}
