"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

interface Row {
  id: string
  title: string
  creator: string | null
  url: string
  image_url: string | null
  published_on: string | null
  price: string | null
  description: string | null
}

const PAGE = 12

const COPY = {
  book: {
    heading: "Books from the last 10 years",
    note: "Found automatically each week from Open Library. Not reviewed or endorsed by ANDA, so check a book suits your family before buying.",
    date: (d: string) => `Published ${d.slice(0, 4)}`,
    action: "View on Open Library",
  },
  app: {
    heading: "More apps, updated in the last 5 years",
    note: "Found automatically each week from the App Store. Not reviewed or endorsed by ANDA, so check an app's privacy and in-app purchases before installing.",
    date: (d: string) => `Updated ${new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`,
    action: "View in the App Store",
  },
} as const

// Books and apps from public.discovered_resources (scripts/047), newest first.
export function DiscoveredList({ kind }: { kind: "book" | "app" }) {
  const [rows, setRows] = useState<Row[]>([])
  const [state, setState] = useState<"loading" | "ready" | "error">("loading")
  const [hasMore, setHasMore] = useState(false)
  const copy = COPY[kind]

  async function load(offset: number) {
    const { data, error } = await createClient()
      .from("discovered_resources")
      .select("id, title, creator, url, image_url, published_on, price, description")
      .eq("kind", kind)
      .order("published_on", { ascending: false, nullsFirst: false })
      .range(offset, offset + PAGE) // one extra row tells us whether there's more
    if (error) {
      setState("error")
      return
    }
    setRows((prev) => [...(offset ? prev : []), ...(data ?? []).slice(0, PAGE)])
    setHasMore((data ?? []).length > PAGE)
    setState("ready")
  }

  useEffect(() => {
    load(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per kind
  }, [kind])

  // Nothing to show yet (the weekly job hasn't run, or the table isn't set up):
  // stay out of the way rather than showing an empty section.
  if (state !== "ready" || rows.length === 0) return null

  return (
    <section aria-labelledby={`discovered-${kind}`} className="py-12 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id={`discovered-${kind}`} className="text-2xl font-semibold mb-2">
          {copy.heading}
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-3xl">{copy.note}</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Card className="h-full">
                <CardContent className="p-4 flex gap-4">
                  {r.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- external cover/icon URLs
                    <img
                      src={r.image_url}
                      alt=""
                      loading="lazy"
                      className={`shrink-0 object-cover bg-muted ${kind === "app" ? "h-16 w-16 rounded-xl" : "h-24 w-16 rounded"}`}
                    />
                  ) : (
                    <div aria-hidden="true" className={`shrink-0 bg-muted ${kind === "app" ? "h-16 w-16 rounded-xl" : "h-24 w-16 rounded"}`} />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="font-medium leading-snug break-words">{r.title}</h3>
                    {r.creator && <p className="text-sm text-muted-foreground truncate">{r.creator}</p>}
                    <p className="text-xs text-muted-foreground">
                      {[r.published_on ? copy.date(r.published_on) : null, r.price].filter(Boolean).join(" · ")}
                    </p>
                    {r.description && <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>}
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary underline"
                    >
                      {copy.action}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
        {hasMore && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => load(rows.length)}>
              Show more
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
