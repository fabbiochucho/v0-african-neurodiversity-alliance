"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/lib/icons"
import { IEPService } from "@/lib/iep-service"
import { createClient } from "@/lib/supabase/client"
import { isFederationEnabled } from "@/lib/federation/config"
import { mapRemoteAssessmentResult, goalDomainForDiagnosisDomain } from "@/lib/federation/map-assessment-domains"
import { GOAL_DOMAINS } from "@/lib/constants/iep"
import type { DiagnosisDomain, GeneratedGoal, GoalDomain, LearnerProfile, SubscriptionTier } from "@/lib/types/iep"
import { calmMessage } from "@/lib/calm"

type LearnerDraft = Pick<LearnerProfile, "name" | "age" | "gender" | "country" | "diagnosis_domains">
type WizardGoal = GeneratedGoal & { fromSuggestion: boolean }
type Step = "person" | "areas" | "goals" | "review"

const STEPS: { id: Step; label: string }[] = [
  { id: "person", label: "Person" },
  { id: "areas", label: "Support areas" },
  { id: "goals", label: "Goals" },
  { id: "review", label: "Review" },
]

const DIAGNOSIS_OPTIONS: { id: DiagnosisDomain; hint: string }[] = [
  { id: "ASD", hint: "Autism" },
  { id: "ADHD", hint: "Attention and activity" },
  { id: "Dyslexia", hint: "Reading and language processing" },
  { id: "Dyspraxia", hint: "Motor coordination and planning" },
  { id: "Sensory", hint: "Sensory processing differences" },
  { id: "Cognitive", hint: "Thinking and executive function" },
]

const MEASUREMENTS = [
  "Check-in rating (1-5) each week",
  "Count how often it happens each week",
  "Observation notes from home or school",
  "Samples of work",
]

const field = "w-full px-3 py-2 border rounded-lg bg-background"

const emptyGoal = (domain: GoalDomain = "communication"): WizardGoal => ({
  domain,
  goal_description: "",
  target_metric: "",
  timeline: "3 months",
  baseline: "",
  measurement: MEASUREMENTS[0],
  target_date: "",
  fromSuggestion: false,
})

interface Props {
  learners: LearnerProfile[]
  initialLearnerId?: string
  canAddLearner: boolean
  learnerLimit: number
  upgradeTier: SubscriptionTier
}

export function GenerateIEPForm({ learners, initialLearnerId, canAddLearner, learnerLimit, upgradeTier }: Props) {
  const [step, setStep] = useState<Step>("person")
  const [learnerId, setLearnerId] = useState<string | "new">(
    initialLearnerId ?? (learners.length > 0 ? learners[0].id : "new"),
  )
  const [profile, setProfile] = useState<Partial<LearnerDraft>>({ name: "", age: 0, gender: "", country: "", diagnosis_domains: [] })
  const [goals, setGoals] = useState<WizardGoal[]>([])
  const [draft, setDraft] = useState<WizardGoal | null>(null)
  const [draftStep, setDraftStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Support areas chosen in this session for an existing person (only used
  // to shape suggestions; their saved profile isn't changed).
  const [existingAreas, setExistingAreas] = useState<Record<string, DiagnosisDomain[]>>({})

  const existing = learners.find((l) => l.id === learnerId)
  const person: Partial<LearnerDraft> = existing ?? profile
  const areas =
    (learnerId === "new" ? profile.diagnosis_domains : (existingAreas[learnerId] ?? existing?.diagnosis_domains)) ?? []
  function setAreas(next: DiagnosisDomain[]) {
    if (learnerId === "new") setProfile((p) => ({ ...p, diagnosis_domains: next }))
    else setExistingAreas((prev) => ({ ...prev, [learnerId]: next }))
  }

  // Optional Neu Rafiki import (Phase 1 federation, see lib/federation/).
  const [canImport, setCanImport] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (!isFederationEnabled()) return
    ;(async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("linked_accounts")
        .select("id, scopes")
        .eq("local_user_id", user.id)
        .eq("remote_app", "neurafiki")
        .eq("status", "active")
      setCanImport((data || []).some((row) => (row.scopes as string[])?.includes("assessment_sync")))
    })().catch(() => setCanImport(false))
  }, [])

  async function importFromNeuRafiki() {
    setImporting(true)
    setImportMessage(null)
    try {
      const res = await fetch("/api/federation/import-assessment", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to import assessment results")
      const mapped = mapRemoteAssessmentResult(data)
      if (mapped.length === 0) throw new Error("Neu Rafiki didn't return any recognized assessment domains.")

      setAreas(Array.from(new Set([...areas, ...mapped.map((m) => m.domain)])))
      setGoals((prev) => [
        ...prev,
        ...mapped.map(({ domain, profileName, source }) => ({
          ...emptyGoal(goalDomainForDiagnosisDomain(domain)),
          goal_description: `Address ${domain} needs identified by the Neu Rafiki assessment`,
          baseline:
            source.percentage_score != null
              ? `Assessment score ${source.percentage_score.toFixed(1)}%${source.risk_level ? ` (risk level: ${source.risk_level})` : ""}`
              : "See Neu Rafiki assessment",
          target_metric: "Improvement on the next assessment and in weekly check-ins",
          notes: source.recommendations
            ? `Imported from Neu Rafiki assessment (${profileName}). ${source.recommendations}`
            : `Imported from Neu Rafiki assessment (${profileName}).`,
        })),
      ])
      setImportMessage({ ok: true, text: `Imported ${mapped.length} area${mapped.length === 1 ? "" : "s"} and draft goals. Check each goal's baseline.` })
    } catch (err) {
      setImportMessage({ ok: false, text: calmMessage(err) })
    } finally {
      setImporting(false)
    }
  }

  const personReady = learnerId !== "new" || Boolean(profile.name && profile.age && profile.country)
  const suggestions = draft ? IEPService.suggestionsFor(areas, draft.domain) : []

  // The goal builder's own steps: area -> goal -> baseline -> target & measurement.
  const draftSteps = ["Area", "Goal", "Where are they now?", "Target and measurement"]
  const draftStepReady = !draft
    ? false
    : [true, Boolean(draft.goal_description.trim()), Boolean(draft.baseline?.trim()), Boolean(draft.target_metric.trim() && draft.measurement)][
        draftStep
      ]

  async function createPlan() {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      let id = learnerId
      if (id === "new") {
        const res = await fetch("/api/iep/learner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...profile, diagnosis_domains: profile.diagnosis_domains || [] }),
        })
        const learner = await res.json()
        if (!res.ok) throw new Error(learner.error || "Failed to create learner profile")
        id = learner.id
      }

      const strip = ({ fromSuggestion: _ignored, ...g }: WizardGoal): GeneratedGoal => g
      const name = person.name || "learner"
      const res = await fetch("/api/iep/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learner_id: id,
          title: `IEP for ${name}`,
          description: `Individualized Education Plan for ${name}, created ${new Date().toLocaleDateString()}`,
          adaptive_goals: goals.filter((g) => g.fromSuggestion).map(strip),
          custom_goals: goals.filter((g) => !g.fromSuggestion).map(strip),
          ai_summary: IEPService.generateIEPSummary({ name, age: person.age ?? null }, goals),
        }),
      })
      const iep = await res.json()
      if (!res.ok) throw new Error(iep.error || "Failed to create IEP")

      window.location.href = `/journey/${id}`
    } catch (err) {
      setSubmitError(calmMessage(err))
      setIsSubmitting(false)
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <Icons.ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-balance mb-2">Create a plan</h1>
            <p className="text-lg text-muted-foreground">One step at a time. You can change goals later.</p>
          </div>

          <ol aria-label="Plan steps" className="flex gap-2 mb-10 overflow-x-auto pb-2">
            {STEPS.map((s, i) => (
              <li key={s.id} aria-current={step === s.id ? "step" : undefined} className="flex items-center gap-2 shrink-0">
                <span
                  aria-hidden="true"
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    i === stepIndex ? "bg-primary text-primary-foreground" : i < stepIndex ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-medium">{s.label}</span>
              </li>
            ))}
          </ol>

          {step === "person" && (
            <Card>
              <CardHeader>
                <CardTitle>Who is this plan for?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <fieldset className="space-y-2">
                  <legend className="sr-only">Person</legend>
                  {learners.map((l) => (
                    <label key={l.id} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer">
                      <input type="radio" name="learner" checked={learnerId === l.id} onChange={() => setLearnerId(l.id)} />
                      <span className="font-medium">{l.name}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer">
                    <input
                      type="radio"
                      name="learner"
                      checked={learnerId === "new"}
                      disabled={!canAddLearner}
                      onChange={() => setLearnerId("new")}
                    />
                    <span className="font-medium">Someone new</span>
                  </label>
                </fieldset>

                {!canAddLearner && (
                  <UpgradePrompt
                    message={`Your plan includes ${learnerLimit} learner profile${learnerLimit === 1 ? "" : "s"}. You can still add a new plan for someone above.`}
                    requiredTier={upgradeTier}
                  />
                )}

                {learnerId === "new" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="text-sm font-medium space-y-2">
                      <span>Name</span>
                      <input className={field} value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                    </label>
                    <label className="text-sm font-medium space-y-2">
                      <span>Age</span>
                      <input
                        className={field}
                        type="number"
                        min={0}
                        value={profile.age || ""}
                        onChange={(e) => setProfile({ ...profile, age: Number.parseInt(e.target.value) || 0 })}
                        required
                      />
                    </label>
                    <label className="text-sm font-medium space-y-2">
                      <span>Gender (optional)</span>
                      <select className={field} value={profile.gender || ""} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                        <option value="">Prefer not to say</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                      </select>
                    </label>
                    <label className="text-sm font-medium space-y-2">
                      <span>Country</span>
                      <input className={field} value={profile.country || ""} onChange={(e) => setProfile({ ...profile, country: e.target.value })} required />
                    </label>
                  </div>
                )}

                <Button onClick={() => setStep("areas")} disabled={!personReady}>
                  Next: support areas
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "areas" && (
            <div className="space-y-6">
              {canImport && (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle>Import from Neu Rafiki</CardTitle>
                    <CardDescription>Pre-fill support areas and draft goals from a completed assessment.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {importMessage && (
                      <p role={importMessage.ok ? "status" : "alert"} className={`text-sm ${importMessage.ok ? "text-primary" : "text-destructive"}`}>
                        {importMessage.text}
                      </p>
                    )}
                    <Button variant="outline" onClick={importFromNeuRafiki} disabled={importing}>
                      {importing ? "Importing..." : "Import assessment"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Which areas need support?</CardTitle>
                  <CardDescription>This only shapes the goal suggestions. Choose any that fit, or none.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DIAGNOSIS_OPTIONS.map(({ id, hint }) => {
                      const selected = areas.includes(id)
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setAreas(selected ? areas.filter((a) => a !== id) : [...areas, id])}
                          className={`text-left p-4 border-2 rounded-lg transition-colors ${selected ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"}`}
                        >
                          <span className="font-semibold block">{id}</span>
                          <span className="text-sm text-muted-foreground">{hint}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep("person")}>
                      Back
                    </Button>
                    <Button onClick={() => setStep("goals")}>Next: goals</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === "goals" && (
            <div className="space-y-6">
              {goals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Goals so far</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {goals.map((g, i) => (
                      <div key={i} className="rounded-lg border p-4 text-sm space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Badge variant="secondary" className="capitalize mb-1">
                              {g.domain}
                            </Badge>
                            <p className="font-semibold">{g.goal_description}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setGoals(goals.filter((_, j) => j !== i))}>
                            Remove
                          </Button>
                        </div>
                        <p>
                          <span className="text-muted-foreground">Now:</span> {g.baseline || "Not set"}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Target:</span> {g.target_metric || "Not set"}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Measured by:</span> {g.measurement}
                          {g.target_date ? ` · by ${g.target_date}` : ""}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {draft ? (
                <Card>
                  <CardHeader>
                    <CardDescription>
                      New goal · step {draftStep + 1} of {draftSteps.length}
                    </CardDescription>
                    <CardTitle>{draftSteps[draftStep]}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {draftStep === 0 && (
                      <label className="block text-sm font-medium space-y-2">
                        <span>Which area is this goal about?</span>
                        <select
                          className={field}
                          value={draft.domain}
                          onChange={(e) => setDraft({ ...draft, domain: e.target.value as GoalDomain, goal_description: "", target_metric: "", fromSuggestion: false })}
                        >
                          {GOAL_DOMAINS.map((d) => (
                            <option key={d} value={d} className="capitalize">
                              {d}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    {draftStep === 1 && (
                      <div className="space-y-4">
                        {suggestions.length > 0 && (
                          <fieldset className="space-y-2">
                            <legend className="text-sm font-medium mb-1">Suggestions</legend>
                            {suggestions.map((s) => (
                              <label key={s.suggestion} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer text-sm">
                                <input
                                  type="radio"
                                  name="suggestion"
                                  className="mt-1"
                                  checked={draft.goal_description === s.suggestion}
                                  onChange={() =>
                                    setDraft({ ...draft, goal_description: s.suggestion, target_metric: draft.target_metric || s.metric, fromSuggestion: true })
                                  }
                                />
                                <span>{s.suggestion}</span>
                              </label>
                            ))}
                          </fieldset>
                        )}
                        <label className="block text-sm font-medium space-y-2">
                          <span>{suggestions.length > 0 ? "Or write your own" : "Describe the goal"}</span>
                          <textarea
                            className={field}
                            rows={2}
                            value={draft.goal_description}
                            onChange={(e) => setDraft({ ...draft, goal_description: e.target.value, fromSuggestion: false })}
                            placeholder="e.g. Ask for a break using a card when overwhelmed"
                          />
                        </label>
                      </div>
                    )}

                    {draftStep === 2 && (
                      <label className="block text-sm font-medium space-y-2">
                        <span>What happens now? This is the baseline you&apos;ll compare against.</span>
                        <textarea
                          className={field}
                          rows={3}
                          value={draft.baseline}
                          onChange={(e) => setDraft({ ...draft, baseline: e.target.value })}
                          placeholder="e.g. Asks for a break about once a week, usually after becoming upset"
                        />
                      </label>
                    )}

                    {draftStep === 3 && (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium space-y-2">
                          <span>What does success look like?</span>
                          <textarea
                            className={field}
                            rows={2}
                            value={draft.target_metric}
                            onChange={(e) => setDraft({ ...draft, target_metric: e.target.value })}
                            placeholder="e.g. Asks for a break before becoming upset, most days"
                          />
                        </label>
                        <label className="block text-sm font-medium space-y-2">
                          <span>How will you measure it?</span>
                          <select className={field} value={draft.measurement} onChange={(e) => setDraft({ ...draft, measurement: e.target.value })}>
                            {MEASUREMENTS.map((m) => (
                              <option key={m}>{m}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block text-sm font-medium space-y-2">
                          <span>Review by (optional)</span>
                          <input type="date" className={field} value={draft.target_date} onChange={(e) => setDraft({ ...draft, target_date: e.target.value })} />
                        </label>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button variant="outline" onClick={() => (draftStep === 0 ? setDraft(null) : setDraftStep(draftStep - 1))}>
                        {draftStep === 0 ? "Cancel" : "Back"}
                      </Button>
                      {draftStep < draftSteps.length - 1 ? (
                        <Button onClick={() => setDraftStep(draftStep + 1)} disabled={!draftStepReady}>
                          Next
                        </Button>
                      ) : (
                        <Button
                          disabled={!draftStepReady}
                          onClick={() => {
                            setGoals([...goals, { ...draft, goal_description: draft.goal_description.trim() }])
                            setDraft(null)
                          }}
                        >
                          Add goal
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => {
                    setDraft(emptyGoal())
                    setDraftStep(0)
                  }}
                >
                  <Icons.Plus className="h-4 w-4 mr-2" />
                  {goals.length === 0 ? "Add the first goal" : "Add another goal"}
                </Button>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("areas")}>
                  Back
                </Button>
                <Button onClick={() => setStep("review")} disabled={goals.length === 0 || draft !== null}>
                  Review plan
                </Button>
              </div>
            </div>
          )}

          {step === "review" && (
            <Card>
              <CardHeader>
                <CardTitle>Review {person.name}&apos;s plan</CardTitle>
                <CardDescription>
                  {goals.length} goal{goals.length === 1 ? "" : "s"}
                  {areas.length > 0 ? ` · support areas: ${areas.join(", ")}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-sm">
                  {goals.map((g, i) => (
                    <li key={i} className="rounded-lg border p-4">
                      <p className="font-semibold">{g.goal_description}</p>
                      <p className="text-muted-foreground">
                        From &ldquo;{g.baseline}&rdquo; to &ldquo;{g.target_metric}&rdquo; · {g.measurement}
                      </p>
                    </li>
                  ))}
                </ul>

                {submitError && (
                  <p role="alert" className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-sm text-destructive">
                    {submitError}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("goals")}>
                    Back
                  </Button>
                  <Button onClick={createPlan} disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create plan"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
