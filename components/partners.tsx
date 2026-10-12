import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// "Supported by" strip. Renders nothing until a partner row is published
// (scripts/041), so it only appears once someone actually backs ANDA.
export async function Partners() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const supabase = createSupabaseClient(url, key)
  const { data: partners } = await supabase
    .from("partners")
    .select("id, name, url, logo_url, kind")
    .order("sort_order")
    .order("name")
  if (!partners?.length) return null

  return (
    <section aria-labelledby="partners-heading" className="py-16 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="partners-heading" className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-8">
          Supported by
        </h2>
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {partners.map((p) => {
            const body = p.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- partner logos are arbitrary external URLs
              <img src={p.logo_url} alt={p.name} className="h-12 w-auto max-w-[180px] object-contain" />
            ) : (
              <span className="text-lg font-semibold">{p.name}</span>
            )
            return (
              <li key={p.id} className="flex flex-col items-center gap-1">
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                    {body}
                  </a>
                ) : (
                  body
                )}
                {p.kind && <span className="text-xs text-muted-foreground">{p.kind}</span>}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
