import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CONSENT_FIELDS, CONSENT_TEXT, CONSENT_VERSION, hasActiveConsent, NOT_SHARED } from "@/lib/companion"
import { ConsentButtons } from "./consent-buttons"

export default async function CompanionConsentPage(props: { params: Promise<{ learnerId: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirectTo=/companion/consent/${params.learnerId}`)

  // Only the learner's owner can decide about sharing their data.
  const { data: learner } = await supabase
    .from("learner_profiles")
    .select("id, name")
    .eq("id", params.learnerId)
    .eq("user_id", user.id)
    .maybeSingle()
  if (!learner) notFound()

  const { data: events } = await supabase
    .from("ai_learner_consent_events")
    .select("action, consent_version, created_at")
    .eq("learner_id", learner.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const active = hasActiveConsent(events ?? [])
  const latest = events?.[0]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <Link href="/companion" className="text-primary hover:underline text-sm">
            Back to Companion
          </Link>
          <h1 className="text-3xl font-bold text-balance">Share {learner.name}&apos;s goals with AI chat?</h1>
          <p className="text-sm">
            Status:{" "}
            <strong>{active ? "Sharing is on" : "Sharing is off"}</strong>
            {latest && (
              <span className="text-muted-foreground">
                {" "}
                (last {latest.action === "granted" ? "agreed" : "withdrawn"} {new Date(latest.created_at).toLocaleString()}
                {latest.action === "granted" && latest.consent_version !== CONSENT_VERSION
                  ? ". The wording has changed since then, so please review and agree again"
                  : ""}
                )
              </span>
            )}
          </p>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What is sent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ul className="list-disc pl-5 space-y-1">
                {CONSENT_FIELDS.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p>
                <strong>Never sent:</strong> {NOT_SHARED.join(", ")}.
              </p>
              <p>
                <strong>Who receives it:</strong> {CONSENT_TEXT.recipient}, only when you choose this learner in a chat
                message.
              </p>
              <p>
                <strong>Why:</strong> {CONSENT_TEXT.why}
              </p>
              <p>
                <strong>Storage:</strong> {CONSENT_TEXT.storage}
              </p>
              <p>
                <strong>Withdrawing:</strong> {CONSENT_TEXT.withdraw}
              </p>
              <p className="text-xs text-muted-foreground">Consent wording version {CONSENT_VERSION}. Your choice is recorded with the date and time.</p>
            </CardContent>
          </Card>

          <ConsentButtons learnerId={learner.id} active={active} />
        </div>
      </main>
    </div>
  )
}
