import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Partners } from "@/components/partners"
import { KenteStrip } from "@/components/afro/kente-strip"
import { ThreadMark } from "@/components/afro/thread-mark"
import { JourneyLoop, type JourneyStep } from "@/components/afro/journey-loop"
import { PATHWAYS } from "@/lib/pathways"
import { getSiteStats } from "@/lib/site-stats"
import { getSiblingAppUrl } from "@/lib/federation/config"
import { neuRafikiLinks } from "@/lib/federation/contract"

// Re-render hourly: partners and the live counts stay current without a redeploy.
export const revalidate = 3600

// Each pathway gets its own thread colour and swatch.
const PATHWAY_THREAD: Record<string, { ground: string; ink: string }> = {
  individual: { ground: "var(--thread-indigo)", ink: "var(--indigo)" },
  family: { ground: "var(--thread-terracotta)", ink: "var(--terracotta)" },
  professional: { ground: "var(--thread-teal)", ink: "var(--primary)" },
}

const ECOSYSTEM = [
  { href: "/self-test", name: "Self-check", text: "A quick, free check-in on neurodivergent traits, linked to NeuRafiki for the full screening.", thread: "var(--thread-indigo)" },
  { href: "/directory", name: "Find support", text: "Schools, therapists, support groups and helplines across Africa, filterable by condition.", thread: "var(--thread-terracotta)" },
  { href: "/iep", name: "Support plans", text: "Step-by-step plans with goals, strategies and reviews, shared with the people who help.", thread: "var(--thread-teal)" },
  { href: "/learning", name: "Learning", text: "Courses, story books, cartoons and the What works? guide to the evidence.", thread: "var(--thread-gold)" },
  { href: "/news", name: "News & research", text: "African news and open-access research on neurodivergence, updated every day.", thread: "var(--thread-green)" },
  { href: "/apps-tools", name: "Apps & tools", text: "Assistive tech and apps, rated by the community.", thread: "var(--thread-indigo)" },
  { href: "/community", name: "Community", text: "Share experiences and find peer support in moderated spaces.", thread: "var(--thread-terracotta)" },
  { href: "/advocacy", name: "Advocacy", text: "Resources for pushing for inclusive schools and policy.", thread: "var(--thread-teal)" },
]

const COMMITMENTS = [
  {
    title: "No diagnosis needed",
    text: "Start a support profile and a plan from what you already see at home or in class, then add assessments when you have them.",
  },
  {
    title: "Your senses, your settings",
    text: "Calm or vibrant colours, larger text, less motion and higher contrast, set once and kept on every page.",
  },
  {
    title: "Free where it counts",
    text: "The support directory, the research library, the What works? guide and the companion's prompts cost nothing.",
  },
]

export default async function HomePage() {
  // NeuRafiki is the assessment entry point; without it configured, fall back
  // to ANDA's own quick self-check rather than a dead link.
  const nrUrl = getSiblingAppUrl()
  const startUrl = nrUrl ? neuRafikiLinks(nrUrl).assessment() : "/self-test"
  const nrHome = nrUrl ?? "/self-test"
  const stats = await getSiteStats()

  const steps: JourneyStep[] = [
    {
      name: "Assess",
      product: "NeuRafiki",
      text: "A guided, high-depth screening across autism, ADHD, learning, motor, sensory and executive function. It's screening, not a diagnosis.",
      href: nrHome,
      action: "See what the screening covers",
    },
    {
      name: "Understand",
      product: "NeuRafiki",
      text: "Plain-language results, area by area, with a companion that explains what they mean and what to ask professionals.",
      href: nrHome,
      action: "Open NeuRafiki",
    },
    {
      name: "Plan",
      product: "ANDA",
      text: "Turn what you learned into a support plan: strengths, what helps, and goals with a starting point, a target and a review date.",
      href: "/iep",
      action: "Build a support plan",
    },
    {
      name: "Support",
      product: "ANDA",
      text: "Bring parents, teachers and therapists into one team, and find schools, therapists and groups near you.",
      href: "/directory",
      action: "Find support",
    },
    {
      name: "Measure",
      product: "ANDA",
      text: "Log progress in a tap and see it in calm words: doing better, stable, or needs attention.",
      href: "/dashboard",
      action: "Open your dashboard",
    },
    {
      name: "Adapt",
      product: "ANDA",
      text: "See what changed, check in with NeuRafiki, and adjust the plan using what the evidence says works.",
      href: "/learning/what-works",
      action: "See what works",
    },
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
                Understand every mind. <span className="text-primary">Support every journey.</span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground text-pretty leading-relaxed">
                ANDA helps individuals, families, educators and professionals turn neurodiversity assessment into
                practical support, meaningful goals and measurable progress.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild className="h-12 px-7 text-base">
                  <a href={startUrl}>
                    Start with NeuRafiki <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-7 text-base bg-background">
                  <Link href="#pathways">Explore ANDA</Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Tap a step on the loop to see what happens there.
              </p>
            </div>
            <JourneyLoop steps={steps} />
          </div>
        </section>

        <KenteStrip height={8} />

        {/* What's already here, from the live database (no estimates) */}
        {stats && (
          <section aria-label="What you'll find" className="border-b bg-secondary/60">
            <p className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-lg text-pretty">
              Already gathered for you:{" "}
              <Link href="/directory" className="font-semibold underline decoration-[var(--thread-terracotta)] decoration-2">
                {stats.organisations} support organisations
              </Link>
              ,{" "}
              <Link href="/news/research" className="font-semibold underline decoration-[var(--thread-green)] decoration-2">
                {stats.papers.toLocaleString("en-GB")} open-access research papers
              </Link>
              ,{" "}
              <Link href="/learning" className="font-semibold underline decoration-[var(--thread-gold)] decoration-2">
                {stats.books.toLocaleString("en-GB")} books and story books
              </Link>{" "}
              and{" "}
              <Link href="/apps-tools" className="font-semibold underline decoration-[var(--thread-indigo)] decoration-2">
                {stats.apps} apps
              </Link>
              .
            </p>
          </section>
        )}

        {/* Pathways (brief §45): three woven swatches, not three identical cards */}
        <section id="pathways" aria-labelledby="pathways-heading" className="scroll-mt-20 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="pathways-heading" className="text-4xl lg:text-5xl font-semibold text-balance max-w-2xl">
              Where would you like to start?
            </h2>
            <ul className="mt-10 divide-y border-y">
              {PATHWAYS.map((p) => {
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
                Everything in one place
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                From a first check-in to a plan a teacher can follow, and the people and evidence to back it up.
              </p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-10">
              {ECOSYSTEM.map((e) => (
                <li key={e.href} className="border-t">
                  <Link href={e.href} className="group flex gap-4 py-5">
                    <ThreadMark color={e.thread} className="mt-1" />
                    <span>
                      <span className="flex items-center gap-2 font-semibold text-lg group-hover:underline">
                        {e.name}
                        <ArrowRight aria-hidden="true" className="h-4 w-4 opacity-0 -translate-x-1 transition duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                      </span>
                      <span className="mt-1 block text-muted-foreground text-pretty">{e.text}</span>
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
              Made for how support really works in Africa
            </h2>
            <p className="mt-4 text-xl text-loom-muted text-pretty max-w-2xl">
              Often there&apos;s no specialist nearby, no diagnosis yet, and a slow connection. ANDA is built for that.
            </p>
            <ul className="mt-12 grid gap-10 md:grid-cols-3">
              {COMMITMENTS.map((c, i) => (
                <li key={c.title} className="border-t-2 pt-5" style={{ borderColor: ["var(--thread-gold)", "var(--thread-terracotta)", "var(--thread-green)"][i] }}>
                  <h3 className="text-2xl font-semibold">{c.title}</h3>
                  <p className="mt-2 text-loom-muted text-pretty">{c.text}</p>
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
                Join the movement for neurodiversity in Africa
              </h2>
              <p className="mt-4 text-xl text-pretty opacity-95">
                Whether you&apos;re neurodivergent, a caregiver, educator, or advocate, there&apos;s a place for you in our
                community.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="h-12 px-7 text-base bg-background text-foreground hover:bg-background/90">
                <Link href="/self-test">Start your journey</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-7 text-base bg-transparent border-terracotta-foreground text-terracotta-foreground hover:bg-terracotta-foreground hover:text-terracotta"
              >
                <Link href="/donate">Support our mission</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
