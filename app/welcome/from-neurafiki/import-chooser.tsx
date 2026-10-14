"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ImportChooser({ assessmentId, learners }: { assessmentId: string | null; learners: { id: string; name: string }[] }) {
  const [target, setTarget] = useState<string>(learners[0]?.id ?? "new")
  const [newName, setNewName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<{ text: string; upgrade?: boolean } | null>(null)

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        const res = await fetch("/api/federation/import-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessment_id: assessmentId,
            ...(target === "new" ? { new_name: newName } : { learner_id: target }),
          }),
        }).catch(() => null)
        const data = await res?.json().catch(() => ({}))
        if (res?.ok) {
          window.location.href = `/journey/${data.learner_id}/profile`
          return
        }
        setError({
          text: data?.error || "Something didn't save. Your information is still here. Try again.",
          upgrade: data?.code === "upgrade_required",
        })
        setBusy(false)
      }}
    >
      <p>Where should the assessment summary go?</p>
      <fieldset className="space-y-2">
        <legend className="sr-only">Support profile</legend>
        {learners.map((l) => (
          <label key={l.id} className="flex items-center gap-2">
            <input type="radio" name="target" checked={target === l.id} onChange={() => setTarget(l.id)} />
            Add to {l.name}&apos;s support profile
          </label>
        ))}
        <label className="flex items-center gap-2">
          <input type="radio" name="target" checked={target === "new"} onChange={() => setTarget("new")} />
          Start a new support profile
        </label>
        {target === "new" && (
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name or nickname (optional)"
            maxLength={100}
            className="w-full px-3 py-2 border rounded-lg bg-background"
          />
        )}
      </fieldset>
      <Button type="submit" disabled={busy}>
        {busy ? "Importing..." : "Import the summary"}
      </Button>
      {error && (
        <p role="alert" className="text-destructive">
          {error.text}{" "}
          {error.upgrade && (
            <Link href="/iep/settings/subscription" className="underline">
              See ANDA plans
            </Link>
          )}
        </p>
      )}
    </form>
  )
}
