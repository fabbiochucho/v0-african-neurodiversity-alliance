import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Partners } from "@/components/partners"
import { KenteStrip } from "@/components/afro/kente-strip"
import { ThreadMark } from "@/components/afro/thread-mark"
import { JourneyLoop, type JourneyStep } from "@/components/afro/journey-loop"
import { localizePathways } from "@/lib/pathways"
import { getSiteStats } from "@/lib/site-stats"
import { getSiblingAppUrl } from "@/lib/federation/config"
import { neuRafikiLinks } from "@/lib/federation/contract"
import { t, type MessageKey } from "@/lib/i18n"
import { getSiteLanguage } from "@/lib/i18n/server"

// Re-render hourly: partners and the live counts stay current without a redeploy.
export const revalidate = 3600

// Each pathway gets its own thread colour and swatch.
const PATHWAY_THREAD: Record<string, { ground: string; ink: string }> = {
  individual: { ground: "var(--thread-indigo)", ink: "var(--indigo)" },
  family: { ground: "var(--thread-terracotta)", ink: "var(--terracotta)" },
  professional: { ground: "var(--thread-teal)", ink: "var(--primary)" },
}

// name/text are i18n keys: `${key}` and `${key}Text` (lib/i18n/en.ts).
const ECOSYSTEM: { href: string; key: string; thread: string }[] = [
  { href: "/self-test", key: "home.eco.selfCheck", thread: "var(--thread-indigo)" },
  { href: "/directory", key: "home.eco.findSupport", thread: "var(--thread-terracotta)" },
  { href: "/iep", key: "home.eco.plans", thread: "var(--thread-teal)" },
  { href: "/learning", key: "home.eco.learning", thread: "var(--thread-gold)" },
  { href: "/news", key: "home.eco.news", thread: "var(--thread-green)" },
  { href: "/apps-tools", key: "home.eco.apps", thread: "var(--thread-indigo)" },
  { href: "/community", key: "home.eco.community", thread: "var(--thread-terracotta)" },
  { href: "/advocacy", key: "home.eco.advocacy", thread: "var(--thread-teal)" },
]

const COMMITMENTS = ["home.commit.noDiagnosis", "home.commit.senses", "home.commit.free"]

export default async function HomePage() {
  // NeuRafiki is the assessment entry point; without it configured, fall back
  // to ANDA's own quick self-check rather than a dead link.
  const nrUrl = getSiblingAppUrl()
  const startUrl = nrUrl ? neuRafikiLinks(nrUrl).assessment() : "/self-test"
  const nrHome = nrUrl ?? "/self-test"
  const stats = await getSiteStats()
  const lang = await getSiteLanguage()
  const tr = (key: string, vars?: Record<string, string | number>) => t(key as MessageKey, vars, lang)
  const num = (n: number) => n.toLocaleString(lang === "en" ? "en-GB" : lang)
  const step = (key: string, product: JourneyStep["product"], href: string): JourneyStep => ({
    name: tr(key),
    product,
    text: tr(`${key}Text`),
    href,
    action: tr(`${key}Action`),
  })

  const steps: JourneyStep[] = [
    step("home.step.assess", "NeuRafiki", nrHome),
    step("home.step.understand", "NeuRafiki", nrHome),
    step("home.step.plan", "ANDA", "/iep"),
    step("home.step.support", "ANDA", "/directory"),
    step("home.step.measure", "ANDA", "/dashboard"),
    step("home.step.adapt", "ANDA", "/learning/what-works"),
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        {/* Hero: the promise on the left, the whole journey on the right (brief §45, §2) */}
        <section aria-labelledby="hero-heading" className="relative overflow-hidden">
          <div aria-hidden="true" className="afro-texture absolute inset-y-0 right-0 hidden lg:block lg:w-[52%]" />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14 grid gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-center">
            <div className="max-w-xl min-w-0">
              <h1 id="hero-heading" className="text-5xl sm:text-6xl xl:text-[4.25rem] font-semibold leading-[1.02] text-balance">
                {tr("home.heroTitle")} <span className="text-primary">{tr("home.heroTitleAccent")}</span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground text-pretty leading-relaxed">
                {tr("home.heroText")}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild className="h-12 px-7 text-base">
                  <a href={startUrl}>
                    {tr("home.start")} <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-7 text-base bg-background">
                  <Link href="#pathways">{tr("home.explore")}</Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                {tr("home.loopHint")}
              </p>
            </div>
            <JourneyLoop steps={steps} />
          </div>
        </section>

        <KenteStrip height={8} />

        {/* What's already here, from the live database (no estimates) */}
        {stats && (
          <section aria-label={tr("home.statsLabel")} className="border-b bg-secondary/60">
            <p className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-lg text-pretty">
              {tr("home.statsIntro")}{" "}
              <Link href="/directory" className="font-semibold underline decoration-[var(--thread-terracotta)] decoration-2">
                {tr("home.statsOrganisations", { n: num(stats.organisations) })}
              </Link>
              ,{" "}
              <Link href="/news/research" className="font-semibold underline decoration-[var(--thread-green)] decoration-2">
                {tr("home.statsPapers", { n: num(stats.papers) })}
              </Link>
              ,{" "}
              <Link href="/learning" className="font-semibold underline decoration-[var(--thread-gold)] decoration-2">
                {tr("home.statsBooks", { n: num(stats.books) })}
              </Link>{" "}
              {tr("home.statsAnd")}{" "}
              <Link href="/apps-tools" className="font-semibold underline decoration-[var(--thread-indigo)] decoration-2">
                {tr("home.statsApps", { n: num(stats.apps) })}
              </Link>
              .
            </p>
          </section>
        )}

        {/* Pathways (brief §45): three woven swatches, not three identical cards */}
        <section id="pathways" aria-labelledby="pathways-heading" className="scroll-mt-20 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="pathways-heading" className="text-4xl lg:text-5xl font-semibold text-balance max-w-2xl">
              {tr("home.pathwaysTitle")}
            </h2>
            <ul className="mt-10 divide-y border-y">
              {localizePathways(lang).map((p) => {
                const t = PATHWAY_THREAD[p.slug]
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/pathways/${p.slug}`}
                      className="group grid grid-cols-[3rem_1fr_auto] min-[400px]:grid-cols-[4.5rem_1fr_auto] sm:grid-cols-[7rem_1fr_auto] items-center gap-3 min-[400px]:gap-5 sm:gap-8 py-6 hover:bg-secondary/50 focus-visible:bg-secondary/50 transition-colors"
                    >
                      <span
                        aria-hidden="true"
                        className="relative block aspect-square overflow-hidden rounded-xl transition-transform duration-300 group-hover:-rotate-3"
                        style={{ backgroundColor: t.ground }}
                      >
                        <span className="afro-texture absolute inset-0" style={{ ["--texture" as string]: "rgb(255 255 255 / 0.38)" }} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-2xl sm:text-3xl font-semibold break-words hyphens-auto" style={{ color: t.ink }}>
                          {p.title}
                        </span>
                        <span className="mt-1 block text-muted-foreground text-pretty break-words hyphens-auto max-w-2xl">{p.intro}</span>
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="h-6 w-6 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground"
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <KenteStrip height={8} />

        {/* Everything ANDA offers: an index, each entry marked by its thread */}
        <section aria-labelledby="ecosystem-heading" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 id="ecosystem-heading" className="text-4xl font-semibold text-balance">
                {tr("home.ecosystemTitle")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                {tr("home.ecosystemText")}
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-10">
              {ECOSYSTEM.map((e) => (
                <li key={e.href} className="border-t">
                  <Link href={e.href} className="group flex gap-4 py-5">
                    <ThreadMark color={e.thread} className="mt-1" />
                    <span>
                      <span className="flex items-center gap-2 font-semibold text-lg group-hover:underline">
                        {tr(e.key)}
                        <ArrowRight aria-hidden="true" className="h-4 w-4 opacity-0 -translate-x-1 transition duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                      </span>
                      <span className="mt-1 block text-muted-foreground text-pretty">{tr(`${e.key}Text`)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <KenteStrip height={8} />

        {/* Why ANDA: the one committed colour field, mudcloth marks light on dark */}
        <section aria-labelledby="why-heading" className="relative overflow-hidden bg-loom text-loom-foreground">
          <div aria-hidden="true" className="afro-texture absolute inset-0" style={{ ["--texture" as string]: "rgb(243 237 228 / 0.14)" }} />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <h2 id="why-heading" className="text-4xl lg:text-5xl font-semibold text-balance max-w-3xl">
              {tr("home.whyTitle")}
            </h2>
            <p className="mt-4 text-xl text-loom-muted text-pretty max-w-2xl">
              {tr("home.whyText")}
            </p>
            <ul className="mt-12 grid gap-10 md:grid-cols-3">
              {COMMITMENTS.map((c, i) => (
                <li key={c} className="border-t-2 pt-5" style={{ borderColor: ["var(--thread-gold)", "var(--thread-terracotta)", "var(--thread-green)"][i] }}>
                  <h3 className="text-2xl font-semibold">{tr(c)}</h3>
                  <p className="mt-2 text-loom-muted text-pretty">{tr(`${c}Text`)}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Partners />

        <KenteStrip height={8} />

        {/* Close: a solid terracotta field between two strips */}
        <section aria-labelledby="join-heading" className="bg-terracotta text-terracotta-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <h2 id="join-heading" className="text-4xl lg:text-5xl font-semibold text-balance">
                {tr("home.joinTitle")}
              </h2>
              <p className="mt-4 text-xl text-pretty opacity-95">
                {tr("home.joinText")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="h-12 px-7 text-base bg-background text-foreground hover:bg-background/90">
                <Link href="/self-test">{tr("home.joinStart")}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-7 text-base bg-transparent border-terracotta-foreground text-terracotta-foreground hover:bg-terracotta-foreground hover:text-terracotta"
              >
                <Link href="/donate">{tr("home.joinDonate")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
