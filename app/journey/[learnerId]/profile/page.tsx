import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { DataKindBadge } from "@/components/data-kind-badge"
import { ExistingAssessmentForm, SupportProfileForm } from "@/components/support-profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ASSESSMENT_TYPES, SUPPORT_PROFILE_FIELDS, type DataKind, type SupportProfile } from "@/lib/learner-records"

interface RecordRow {
  id: string
  kind: DataKind
  record_type: string
  title: string | null
  record_date: string | null
  author: string | null
  fields: Record<string, unknown>
  file_path: string | null
  created_at: string
}

export default async function LearnerProfilePage({ params }: { params: { learnerId: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirectTo=/journey/${params.learnerId}/profile`)

  const { data: learner } = await supabase.from("learner_profiles").select("id, name, user_id").eq("id", params.learnerId).maybeSingle()
  if (!learner) notFound()
  const isOwner = learner.user_id === user.id

  const { data } = await supabase
    .from("learner_records")
    .select("id, kind, record_type, title, record_date, author, fields, file_path, created_at")
    .eq("learner_id", learner.id)
    .order("created_at", { ascending: false })
  const records = (data ?? []) as RecordRow[]

  const profiles = records.filter((r) => r.record_type === "support_profile")
  const current = profiles[0]?.fields as SupportProfile | undefined
  const others = records.filter((r) => r.record_type !== "support_profile")
  const typeLabel = (t: string) =>
    ASSESSMENT_TYPES.find((a) => a.value === t)?.label ??
    (t === "neurafiki_assessment" ? "NeuRafiki assessment" : t === "neurafiki_check_in" ? "NeuRafiki check-in" : t)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-10">
          <header>
            <Link href={`/journey/${learner.id}`} className="text-primary hover:underline text-sm">
              Back to {learner.name}&apos;s journey
            </Link>
            <h1 className="text-4xl font-bold mt-2">About {learner.name}</h1>
          </header>

          <section aria-labelledby="profile-heading" className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 id="profile-heading" className="text-2xl font-semibold">
                Support profile
              </h2>
              <DataKindBadge kind="observation" />
            </div>
            {current ? (
              <dl className="space-y-3 text-sm">
                {SUPPORT_PROFILE_FIELDS.filter((f) => current[f.key]).map((f) => (
                  <div key={f.key}>
                    <dt className="font-medium">{f.label}</dt>
                    <dd className="whitespace-pre-line text-muted-foreground">{current[f.key]}</dd>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Version {profiles.length}, saved {new Date(profiles[0].created_at).toLocaleDateString()}. Earlier versions
                  are kept.
                </p>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No support profile yet.</p>
            )}
            {isOwner && (
              <details className="rounded-lg border p-4">
                <summary className="cursor-pointer font-medium">{current ? "Update the support profile" : "Write the support profile"}</summary>
                <div className="mt-4">
                  <SupportProfileForm learnerId={learner.id} initial={current} />
                </div>
              </details>
            )}
          </section>

          <section aria-labelledby="inputs-heading" className="space-y-4">
            <h2 id="inputs-heading" className="text-2xl font-semibold">
              Assessments and existing plans
            </h2>
            {others.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing added yet.</p>
            ) : (
              others.map((r) => (
                <Card key={r.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <DataKindBadge kind={r.kind} />
                      <span className="text-sm text-muted-foreground">
                        {typeLabel(r.record_type)}
                        {r.record_date ? ` · ${r.record_date}` : ""}
                        {r.author ? ` · ${r.author}` : ""}
                      </span>
                    </div>
                    {r.title && <CardTitle className="text-lg">{r.title}</CardTitle>}
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    {typeof r.fields.summary === "string" && <p className="whitespace-pre-line">{r.fields.summary}</p>}
                    {r.file_path && (
                      <a href={`/api/learner-records/${r.id}`} className="text-primary hover:underline">
                        Open the document (private link)
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
            {isOwner && (
              <details className="rounded-lg border p-4">
                <summary className="cursor-pointer font-medium">Add an existing assessment</summary>
                <div className="mt-4">
                  <ExistingAssessmentForm learnerId={learner.id} />
                </div>
              </details>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
