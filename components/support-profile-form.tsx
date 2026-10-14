"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ASSESSMENT_TYPES, SUPPORT_PROFILE_FIELDS, type SupportProfile } from "@/lib/learner-records"
import { calmMessage } from "@/lib/calm"

const field = "w-full px-3 py-2 border rounded-lg bg-background"

async function submit(form: HTMLFormElement): Promise<{ learner_id?: string }> {
  const res = await fetch("/api/learner-records", { method: "POST", body: new FormData(form) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Something didn't save. Your information is still here. Try again.")
  return data
}

/** Create a new person with a support profile, or save a new version of an existing one. */
export function SupportProfileForm({
  learnerId,
  initial,
  addAssessmentNext = false,
}: {
  learnerId?: string
  initial?: SupportProfile
  addAssessmentNext?: boolean
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
          const data = await submit(e.currentTarget)
          window.location.href = `/journey/${data.learner_id ?? learnerId}/profile${addAssessmentNext ? "?add=assessment#inputs-heading" : ""}`
        } catch (err) {
          setError(calmMessage(err))
          setBusy(false)
        }
      }}
    >
      <input type="hidden" name="record" value="support_profile" />
      {learnerId ? (
        <input type="hidden" name="learner_id" value={learnerId} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="text-sm font-medium space-y-1 sm:col-span-1">
            <span>Name or nickname</span>
            <input name="new_name" required maxLength={100} className={field} />
          </label>
          <label className="text-sm font-medium space-y-1">
            <span>Age (optional)</span>
            <input name="new_age" type="number" min={0} max={120} className={field} />
          </label>
          <label className="text-sm font-medium space-y-1">
            <span>Country (optional)</span>
            <input name="new_country" maxLength={80} className={field} />
          </label>
        </div>
      )}

      {SUPPORT_PROFILE_FIELDS.map((f) => (
        <label key={f.key} className="block text-sm space-y-1">
          <span className="font-medium">{f.label}</span>
          <span className="block text-muted-foreground">{f.hint}</span>
          <textarea name={f.key} rows={3} maxLength={2000} defaultValue={initial?.[f.key] ?? ""} className={field} />
        </label>
      ))}

      <p className="text-xs text-muted-foreground">
        Saved as an observation from you. Fill in what you know; you can come back to it any time.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        {busy ? "Saving..." : learnerId ? "Save new version" : "Create support profile"}
      </Button>
    </form>
  )
}

/** Record an existing diagnosis, school assessment or plan (professional input). */
export function ExistingAssessmentForm({ learnerId }: { learnerId: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        try {
          await submit(e.currentTarget)
          window.location.reload()
        } catch (err) {
          setError(calmMessage(err))
          setBusy(false)
        }
      }}
    >
      <input type="hidden" name="record" value="assessment" />
      <input type="hidden" name="learner_id" value={learnerId} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-sm font-medium space-y-1">
          <span>Type</span>
          <select name="record_type" required className={field}>
            {ASSESSMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium space-y-1">
          <span>Date</span>
          <input name="record_date" type="date" className={field} />
        </label>
        <label className="text-sm font-medium space-y-1">
          <span>Who did it</span>
          <input name="author" maxLength={200} placeholder="e.g. school psychologist" className={field} />
        </label>
        <label className="text-sm font-medium space-y-1">
          <span>Title (optional)</span>
          <input name="title" maxLength={300} className={field} />
        </label>
      </div>
      <label className="block text-sm font-medium space-y-1">
        <span>Summary</span>
        <textarea name="summary" required rows={4} maxLength={2000} className={field} />
      </label>
      <label className="block text-sm font-medium space-y-1">
        <span>Document (optional: PDF, PNG or JPEG, up to 10 MB, kept private)</span>
        <input name="file" type="file" accept="application/pdf,image/png,image/jpeg" />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        {busy ? "Saving..." : "Add assessment"}
      </Button>
    </form>
  )
}
