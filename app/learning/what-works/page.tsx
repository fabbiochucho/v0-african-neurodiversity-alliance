import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2, CircleHelp, CircleMinus, CircleSlash, ExternalLink, ShieldAlert } from "lucide-react"
import { RATINGS, REVIEWED_ON, SECTIONS, type Rating } from "@/lib/what-works"

export const metadata = {
  title: "What Works | ANDA",
  description:
    "What the research says about learning support, exercise, sleep, nutrition, gut health, supplements and natural therapies for autistic people and people with ADHD and dyslexia.",
}

// Each rating has its own icon and label so it never relies on colour alone.
const RATING_STYLE: Record<Rating, { icon: typeof CheckCircle2; className: string }> = {
  strong: { icon: CheckCircle2, className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" },
  good: { icon: CheckCircle2, className: "bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200" },
  mixed: { icon: CircleMinus, className: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
  uncertain: { icon: CircleHelp, className: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200" },
  "not-supported": { icon: CircleSlash, className: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200" },
  dangerous: { icon: ShieldAlert, className: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200" },
}

function RatingPill({ rating }: { rating: Rating }) {
  const { icon: Icon, className } = RATING_STYLE[rating]
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {RATINGS[rating].label}
    </span>
  )
}

export default function WhatWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="max-w-3xl mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Learning · Evidence guide</p>
          <h1 className="text-4xl font-bold text-balance mb-4">What works?</h1>
          <p className="text-lg text-muted-foreground text-pretty">
            What the research says about learning support, exercise, sleep, nutrition, gut health, supplements and natural
            therapies for autistic people and people with ADHD and dyslexia, based on systematic reviews, meta-analyses and
            clinical guidelines. Last reviewed {REVIEWED_ON}.
          </p>
        </header>

        <div className="max-w-3xl mb-10 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm">
            This guide is general information, not medical advice. Talk to a doctor, nurse, pharmacist or dietitian before
            starting a supplement or changing your child&apos;s diet, and don&apos;t stop prescribed medication. Most studies
            were small, short, or done outside Africa.
          </p>
        </div>

        <section aria-labelledby="key-heading" className="mb-10">
          <h2 id="key-heading" className="sr-only">
            How to read the ratings
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(RATINGS) as Rating[]).map((r) => (
              <div key={r} className="flex flex-col gap-1">
                <dt>
                  <RatingPill rating={r} />
                </dt>
                <dd className="text-sm text-muted-foreground">{RATINGS[r].description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <nav aria-label="Topics" className="mb-12 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="rounded-full border px-3 py-1.5 text-sm hover:border-primary hover:text-primary">
              {s.title}
            </a>
          ))}
        </nav>

        <div className="space-y-14">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-24">
              <h2 id={`${section.id}-heading`} className="text-2xl font-semibold mb-2">
                {section.title}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-3xl">{section.intro}</p>
              <div className="grid gap-6 lg:grid-cols-2">
                {section.items.map((item) => (
                  <Card key={item.id} id={item.id} className="min-w-0 scroll-mt-24">
                    <CardHeader className="space-y-2">
                      <RatingPill rating={item.rating} />
                      <CardTitle className="text-lg leading-snug">{item.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.conditions}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>{item.summary}</p>
                      <div>
                        <h3 className="text-sm font-semibold mb-1">What this means for you</h3>
                        <p className="text-sm">{item.practical}</p>
                      </div>
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium text-primary">
                          Sources ({item.sources.length})
                        </summary>
                        <ul className="mt-2 space-y-1.5">
                          {item.sources.map((s) => (
                            <li key={s.url}>
                              <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline break-words">
                                {s.label}
                                <ExternalLink className="inline h-3 w-3 ml-1" aria-hidden="true" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-16 max-w-3xl space-y-2 text-sm text-muted-foreground">
          <p>
            New open-access research on these topics arrives daily on{" "}
            <Link href="/news#research" className="underline">
              News &amp; Research
            </Link>
            . Looking for support near you? Try the{" "}
            <Link href="/directory" className="underline">
              Find Support directory
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  )
}
