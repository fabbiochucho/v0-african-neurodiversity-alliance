import { notFound } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { PATHWAYS, localizePathways } from "@/lib/pathways"
import { t } from "@/lib/i18n"
import { getSiteLanguage } from "@/lib/i18n/server"

export function generateStaticParams() {
  return PATHWAYS.map((p) => ({ who: p.slug }))
}

export default async function PathwayPage(props: { params: Promise<{ who: string }> }) {
  const params = await props.params;
  const lang = await getSiteLanguage()
  const pathway = localizePathways(lang).find((p) => p.slug === params.who)
  if (!pathway) notFound()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-2xl space-y-8">
        <header>
          <Link href="/#pathways" className="text-primary underline underline-offset-2 text-sm">
            {t("common.allPathways", {}, lang)}
          </Link>
          <h1 className="text-4xl font-bold mt-2 mb-3">{pathway.title}</h1>
          <p className="text-lg text-muted-foreground">{pathway.intro}</p>
        </header>
        <ol className="space-y-4">
          {pathway.steps.map((step, i) => (
            <li key={step.href + i} className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t("common.step", { n: i + 1 }, lang)}</p>
              <Link href={step.href} className="font-semibold text-primary underline underline-offset-2">
                {step.label}
              </Link>
              <p className="text-sm mt-1">{step.detail}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  )
}
