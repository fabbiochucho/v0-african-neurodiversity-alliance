import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PersonSummary } from "@/lib/journey"
import type { LearnerProfile } from "@/lib/types/iep"

/** Dashboard card: how is this person doing, what are we working on, what's next. */
export function PersonCard({ learner, summary }: { learner: LearnerProfile; summary: PersonSummary }) {
  const next = summary.nextSteps[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{learner.name}</CardTitle>
        <CardDescription>{summary.headline}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <h3 className="font-semibold mb-1">Working on</h3>
          {summary.priorities.length === 0 ? (
            <p className="text-muted-foreground">Nothing flagged right now.</p>
          ) : (
            <ul className="space-y-1">
              {summary.priorities.slice(0, 2).map((p) => (
                <li key={p.goalId}>
                  {p.text} <span className="text-muted-foreground">({p.reason})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {next && (
          <div>
            <h3 className="font-semibold mb-1">Next</h3>
            <p>{next.label}</p>
          </div>
        )}
        <Link
          href={`/journey/${learner.id}`}
          className="inline-block font-medium text-primary underline-offset-4 hover:underline"
        >
          Open {learner.name}&apos;s journey
        </Link>
      </CardContent>
    </Card>
  )
}

/** Strengths / priorities / next-step cards for the journey page. */
export function SummaryCards({ summary }: { summary: PersonSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Strengths</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {summary.strengths.length === 0 ? (
            <p className="text-muted-foreground">Strengths show up here as check-ins are logged.</p>
          ) : (
            <ul className="space-y-2">
              {summary.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Priorities</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {summary.priorities.length === 0 ? (
            <p className="text-muted-foreground">No goals need extra attention right now.</p>
          ) : (
            <ul className="space-y-2">
              {summary.priorities.map((p) => (
                <li key={p.goalId}>
                  {p.text}
                  <span className="block text-muted-foreground">{p.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next steps</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {summary.nextSteps.length === 0 ? (
            <p className="text-muted-foreground">You&apos;re up to date.</p>
          ) : (
            <ul className="space-y-2">
              {summary.nextSteps.map((step) => (
                <li key={step.label}>
                  {step.href ? (
                    <Link href={step.href} className="text-primary underline-offset-4 hover:underline">
                      {step.label}
                    </Link>
                  ) : (
                    step.label
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
