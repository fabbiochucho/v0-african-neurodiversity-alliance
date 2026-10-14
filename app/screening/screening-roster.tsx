"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SCREENING_OPTIONS, SCREENING_QUESTIONS, screeningFlag } from "@/lib/screening"
import { mapRemoteAssessmentResult } from "@/lib/federation/map-assessment-domains"
import { calmMessage } from "@/lib/calm"

interface Screening {
  id: string
  learner_id: string
  kind: string
  areas: string[]
  source_note: string | null
  created_at: string
}

type Imported = { profileName: string; areas: string[]; note: string }

export function ScreeningRoster({
  learners,
  screenings,
  canImportInDepth,
  inDepthUpsell,
}: {
  learners: { id: string; name: string }[]
  screenings: Screening[]
  canImportInDepth: boolean
  inDepthUpsell: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imported, setImported] = useState<Imported[] | null>(null)

  async function post(body: object) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/screening", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Couldn't save")
      setOpen(null)
      setAnswers({})
      router.refresh()
    } catch (err) {
      setError(calmMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function loadNeuRafiki() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/federation/import-assessment", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Couldn't reach Neu Rafiki")
      // Keep Neu Rafiki's own reported risk level next to each area rather
      // than filtering by it here (that would be inventing a cut-off).
      const byProfile = new Map<string, { areas: string[]; parts: string[] }>()
      for (const m of mapRemoteAssessmentResult(data)) {
        const entry = byProfile.get(m.profileName) ?? { areas: [], parts: [] }
        entry.areas.push(m.domain)
        entry.parts.push(m.source.risk_level ? `${m.domain}: ${m.source.risk_level}` : m.domain)
        byProfile.set(m.profileName, entry)
      }
      setImported(
        Array.from(byProfile, ([profileName, entry]) => ({
          profileName,
          areas: entry.areas,
          note: `${profileName}. ${entry.parts.join("; ")}`,
        })),
      )
    } catch (err) {
      setError(calmMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {canImportInDepth && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Button variant="outline" size="sm" disabled={busy} onClick={loadNeuRafiki}>
            Load in-depth results from Neu Rafiki
          </Button>
          {imported && <span className="text-muted-foreground">{imported.length} assessment profile(s) found. Attach one to a learner below.</span>}
        </div>
      )}
      {inDepthUpsell && (
        <p className="text-sm text-muted-foreground">
          Premium and above can bring in-depth Neu Rafiki assessment results into each learner&apos;s record.{" "}
          <Link href="/iep/settings/subscription" className="text-primary hover:underline">
            See plans
          </Link>
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {learners.map((l) => {
        const latest = screenings.filter((s) => s.learner_id === l.id)
        return (
          <Card key={l.id}>
            <CardHeader>
              <CardTitle className="text-lg">{l.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {latest.length === 0 ? (
                <p className="text-muted-foreground">Not screened yet.</p>
              ) : (
                <ul className="space-y-1">
                  {latest.slice(0, 3).map((s) => (
                    <li key={s.id}>
                      <span className="text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString()} ·{" "}
                        {s.kind === "neurafiki" ? `Neu Rafiki assessment${s.source_note ? ` (${s.source_note})` : ""}` : "Quick check-in"}:
                      </span>{" "}
                      {s.kind === "neurafiki"
                        ? "Recorded as reported by Neu Rafiki (area: risk level). Discuss these with a qualified professional."
                        : s.areas.length > 0
                          ? `Areas to look into: ${s.areas.join(", ")}. Consider a professional assessment.`
                          : "Nothing was marked as coming up often."}
                    </li>
                  ))}
                </ul>
              )}

              {open === l.id ? (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    post({ learner_id: l.id, kind: "quick", answers })
                  }}
                >
                  {SCREENING_QUESTIONS.map((q) => (
                    <fieldset key={q.id}>
                      <legend className="font-medium">{q.observerText}</legend>
                      <div className="flex gap-4 mt-1">
                        {SCREENING_OPTIONS.map((o) => (
                          <label key={o.value} className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name={`${l.id}-${q.id}`}
                              checked={answers[q.id] === o.value}
                              onChange={() => setAnswers({ ...answers, [q.id]: o.value })}
                            />
                            {o.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                  {Object.keys(answers).length === SCREENING_QUESTIONS.length && (
                    <p className="text-muted-foreground">{screeningFlag(answers).summary}</p>
                  )}
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={busy || Object.keys(answers).length < SCREENING_QUESTIONS.length}>
                      Save
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAnswers({})
                      setOpen(l.id)
                    }}
                  >
                    Quick check-in
                  </Button>
                  {imported?.map((p) => (
                    <Button
                      key={p.profileName}
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => post({ learner_id: l.id, kind: "neurafiki", areas: p.areas, source_note: p.note })}
                    >
                      Attach &ldquo;{p.profileName}&rdquo; results
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
