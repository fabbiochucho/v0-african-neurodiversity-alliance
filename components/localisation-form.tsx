"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { EDUCATION_CONTEXTS, LANGUAGES, t } from "@/lib/i18n"

const field = "w-full px-3 py-2 border rounded-lg bg-background"

export function LocalisationForm({
  learnerId,
  initial,
}: {
  learnerId: string
  initial: { country: string | null; region: string | null; language: string | null; education_context: string | null }
}) {
  const router = useRouter()
  const [values, setValues] = useState({
    country: initial.country ?? "",
    region: initial.region ?? "",
    language: initial.language ?? "en",
    education_context: initial.education_context ?? "other",
  })
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        const res = await fetch(`/api/learners/${learnerId}/settings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }).catch(() => null)
        setBusy(false)
        if (res?.ok) {
          setStatus({ ok: true, text: "Saved." })
          router.refresh()
        } else setStatus({ ok: false, text: t("state.saveFailed") })
      }}
    >
      <p className="text-sm text-muted-foreground">{t("settings.localisation.help")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm font-medium space-y-1">
          <span>Country</span>
          <input value={values.country} onChange={(e) => setValues({ ...values, country: e.target.value })} maxLength={80} className={field} />
        </label>
        <label className="text-sm font-medium space-y-1">
          <span>Region or state</span>
          <input value={values.region} onChange={(e) => setValues({ ...values, region: e.target.value })} maxLength={100} className={field} />
        </label>
        <label className="text-sm font-medium space-y-1">
          <span>Language</span>
          <select value={values.language} onChange={(e) => setValues({ ...values, language: e.target.value })} className={field}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium space-y-1">
          <span>Education context</span>
          <select value={values.education_context} onChange={(e) => setValues({ ...values, education_context: e.target.value })} className={field}>
            {EDUCATION_CONTEXTS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Button type="submit" size="sm" disabled={busy}>
        Save
      </Button>
      {status && (
        <p role={status.ok ? "status" : "alert"} className={`text-sm ${status.ok ? "text-primary" : "text-destructive"}`}>
          {status.text}
        </p>
      )}
    </form>
  )
}
