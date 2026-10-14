import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { PrintButton } from "@/components/print-button"
import { FEATURE_MIN_TIER, getEntitlement } from "@/lib/entitlements"
import { loadJourneys } from "@/lib/journey-data"
import { buildReport, FINDING_SOURCE_LABELS, REPORT_TITLES, type ReportKind } from "@/lib/report-builder"
import { PROGRESS_STATUS_LABELS, PROGRESS_STATUS_RULES, type ProgressStatus } from "@/lib/progress-status"
import { logAudit } from "@/lib/audit"
import type { LearnerProfile } from "@/lib/types/iep"

const KINDS: ReportKind[] = ["weekly", "monthly", "quarterly", "changes"]
const isDate = (v?: string) => Boolean(v && /^\d{4}-\d{2}-\d{2}$/.test(v))

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: { learnerId: string }
  searchParams: { kind?: string; from?: string; to?: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirectTo=/journey/${params.learnerId}/report`)

  const { data: learner } = await supabase.from("learner_profiles").select("*").eq("id", params.learnerId).maybeSingle()
  if (!learner) notFound()

  const kind = (KINDS as string[]).includes(searchParams.kind ?? "") ? (searchParams.kind as ReportKind) : "weekly"
  const isOwner = learner.user_id === user.id
  // Weekly summaries are free. Fuller reports need the owner's Premium+
  // plan, or a team member's generate_report permission.
  const allowed =
    kind === "weekly" ||
    (isOwner
      ? (await getEntitlement(supabase, user.id)).can("reports")
      : (await supabase.rpc("has_permission", { p_learner_id: learner.id, p_perm: "generate_report" })).data === true)

  const [journey] = await loadJourneys(supabase, [learner as LearnerProfile])
  const today = new Date().toISOString().slice(0, 10)
  const from = isDate(searchParams.from) ? searchParams.from : new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
  const to = isDate(searchParams.to) ? searchParams.to : today
  const report = allowed ? buildReport(kind, learner.name, journey.input, { from, to }) : null
  if (report) await logAudit({ actorId: user.id, ownerId: learner.user_id, learnerId: learner.id, action: "view", resource: `${REPORT_TITLES[kind]} viewed` })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-3xl space-y-6">
        <header className="space-y-3 print:hidden">
          <Link href={`/journey/${learner.id}`} className="text-primary hover:underline text-sm">
            Back to {learner.name}&apos;s journey
          </Link>
          <nav aria-label="Report type" className="flex flex-wrap gap-2 text-sm">
            {KINDS.map((k) => (
              <Link
                key={k}
                href={`/journey/${learner.id}/report?kind=${k}`}
                aria-current={k === kind ? "page" : undefined}
                className={`rounded-md border px-3 py-1 ${k === kind ? "border-primary bg-primary/10 font-medium" : ""}`}
              >
                {REPORT_TITLES[k]}
              </Link>
            ))}
          </nav>
          {kind === "changes" && (
            <form className="flex flex-wrap items-end gap-3 text-sm">
              <input type="hidden" name="kind" value="changes" />
              <label className="space-y-1">
                <span className="block font-medium">From</span>
                <input type="date" name="from" defaultValue={from} max={today} className="px-3 py-2 border rounded-lg bg-background" />
              </label>
              <label className="space-y-1">
                <span className="block font-medium">To</span>
                <input type="date" name="to" defaultValue={to} max={today} className="px-3 py-2 border rounded-lg bg-background" />
              </label>
              <button type="submit" className="rounded-md border px-3 py-2">
                Compare
              </button>
            </form>
          )}
        </header>

        {!report ? (
          <UpgradePrompt message="Monthly, quarterly and What changed? reports are part of Premium." requiredTier={FEATURE_MIN_TIER.reports} />
        ) : (
          <article className="space-y-6">
            <header>
              <h1 className="text-3xl font-bold">
                {report.title}: {learner.name}
              </h1>
              <p className="text-muted-foreground">{report.period}</p>
            </header>
            {report.sections.map((s) => (
              <section key={s.heading} className="space-y-2">
                <h2 className="text-xl font-semibold">{s.heading}</h2>
                <ul className="space-y-2">
                  {s.findings.map((f, i) => (
                    <li key={i} className="text-sm">
                      <span className="mr-2 rounded-full border px-2 py-0.5 text-xs">{FINDING_SOURCE_LABELS[f.source]}</span>
                      {f.text}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <details className="text-sm print:hidden">
              <summary className="cursor-pointer">How progress words are decided</summary>
              <dl className="mt-2 space-y-1">
                {(Object.keys(PROGRESS_STATUS_RULES) as ProgressStatus[]).map((s) => (
                  <div key={s}>
                    <dt className="inline font-medium">{PROGRESS_STATUS_LABELS[s]}: </dt>
                    <dd className="inline text-muted-foreground">{PROGRESS_STATUS_RULES[s]}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-muted-foreground">
                Numbers are shown only for goals measured by a rating or a count. Other goals are described in words.
              </p>
            </details>
            <PrintButton />
          </article>
        )}
      </main>
    </div>
  )
}
