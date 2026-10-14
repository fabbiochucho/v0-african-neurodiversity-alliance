import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { PrintButton } from "@/components/print-button"
import { DataKindBadge } from "@/components/data-kind-badge"
import { loadJourneys } from "@/lib/journey-data"
import { allGoals, summarisePerson } from "@/lib/journey"
import { PROGRESS_STATUS_LABELS, progressStatus } from "@/lib/progress-status"
import { quantitativeSupported } from "@/lib/report-builder"
import { SUPPORT_PROFILE_FIELDS, type DataKind, type SupportProfile } from "@/lib/learner-records"
import { termsFor } from "@/lib/i18n"
import type { LearnerProfile } from "@/lib/types/iep"

// "Prepare for review" (brief §14): one printable pack of the person's
// profile, current goals with progress, recent records and what's next,
// to take into a school or professional review meeting.
export default async function ReviewPackPage({ params }: { params: { learnerId: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirectTo=/journey/${params.learnerId}/review-pack`)

  const { data: learner } = await supabase.from("learner_profiles").select("*").eq("id", params.learnerId).maybeSingle()
  if (!learner) notFound()

  const [journey] = await loadJourneys(supabase, [learner as LearnerProfile])
  const terms = termsFor(learner.education_context)
  const goals = allGoals(journey.input).filter((g) => g.status === "in_progress")
  const records = journey.input.records ?? []
  const profile = records.find((r) => r.record_type === "support_profile")?.fields as SupportProfile | undefined
  const recent = records.filter((r) => r.record_type !== "support_profile").slice(0, 8)
  const summary = summarisePerson(journey.input)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
        <Link href={`/journey/${learner.id}`} className="text-primary hover:underline text-sm print:hidden">
          Back to {learner.name}&apos;s journey
        </Link>
        <header>
          <h1 className="text-3xl font-bold">Review pack: {learner.name}</h1>
          <p className="text-muted-foreground">
            Prepared {new Date().toLocaleDateString()} for a {terms.planShort} review. {summary.headline}
          </p>
        </header>

        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">About {learner.name}</h2>
            <DataKindBadge kind="observation" />
          </div>
          {profile ? (
            <dl className="space-y-2 text-sm">
              {SUPPORT_PROFILE_FIELDS.filter((f) => profile[f.key]).map((f) => (
                <div key={f.key}>
                  <dt className="font-medium">{f.label}</dt>
                  <dd className="whitespace-pre-line">{profile[f.key]}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No support profile written yet.</p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Current goals and progress</h2>
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No goals in the plan yet.</p>
          ) : (
            goals.map((g) => {
              const s = progressStatus(g.progress_logs ?? [])
              return (
                <div key={g.id} className="rounded-lg border p-3 text-sm space-y-1">
                  <p className="font-semibold">{g.goal_text}</p>
                  <p>
                    {PROGRESS_STATUS_LABELS[s.status]}
                    {quantitativeSupported(g) && s.recent !== null ? ` · 30-day average ${s.recent.toFixed(1)}/5` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    Started from: {g.baseline ?? "not recorded"} · Aiming for: {g.target ?? "not recorded"}
                    {g.review_date ? ` · Review by ${g.review_date}` : ""}
                  </p>
                </div>
              )
            })
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Recent assessments, input and check-ins</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing added yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recent.map((r) => (
                <li key={r.id}>
                  <DataKindBadge kind={r.kind as DataKind} /> {r.title}
                  {typeof r.fields?.summary === "string" ? `: ${r.fields.summary}` : ""}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Questions and next steps to discuss</h2>
          <ul className="list-disc pl-5 text-sm">
            {summary.nextSteps.length === 0 ? <li>Keep going with regular check-ins.</li> : summary.nextSteps.map((s) => <li key={s.label}>{s.label}</li>)}
          </ul>
        </section>

        <p className="text-xs text-muted-foreground">{terms.disclaimer}</p>
        <PrintButton />
      </main>
    </div>
  )
}
