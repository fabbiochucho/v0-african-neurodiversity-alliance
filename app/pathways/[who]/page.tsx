import { notFound } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { PATHWAYS, findPathway } from "@/lib/pathways"

export function generateStaticParams() {
  return PATHWAYS.map((p) => ({ who: p.slug }))
}

export default function PathwayPage({ params }: { params: { who: string } }) {
  const pathway = findPathway(params.who)
  if (!pathway) notFound()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-2xl space-y-8">
        <header>
          <Link href="/#pathways" className="text-primary hover:underline text-sm">
            All pathways
          </Link>
          <h1 className="text-4xl font-bold mt-2 mb-3">{pathway.title}</h1>
          <p className="text-lg text-muted-foreground">{pathway.intro}</p>
        </header>
        <ol className="space-y-4">
          {pathway.steps.map((step, i) => (
            <li key={step.label} className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Step {i + 1}</p>
              <Link href={step.href} className="font-semibold text-primary hover:underline">
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
