import { Navigation } from "@/components/navigation"
import { LEGAL_UPDATED } from "@/lib/legal"

// Reading layout for the privacy policy and terms: one column at a
// comfortable measure, a contents list, and section headings to scan by.
export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string
  intro: string
  sections: { id: string; heading: string; body: React.ReactNode }[]
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <article className="mx-auto max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold text-balance">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated {LEGAL_UPDATED}</p>
          <p className="mt-6 text-lg text-pretty">{intro}</p>

          <nav aria-label="On this page" className="mt-8 rounded-2xl border bg-card p-5">
            <h2 className="font-sans text-sm font-semibold">On this page</h2>
            <ol className="mt-3 grid gap-1.5 sm:grid-cols-2 text-sm list-decimal list-inside">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="underline hover:text-primary">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-10 space-y-10">
            {sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
                <h2 id={`${s.id}-h`} className="text-2xl font-semibold">
                  {s.heading}
                </h2>
                <div className="mt-3 space-y-3 leading-relaxed text-pretty [&_a]:text-primary [&_a]:underline [&_a]:[overflow-wrap:anywhere] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  )
}
