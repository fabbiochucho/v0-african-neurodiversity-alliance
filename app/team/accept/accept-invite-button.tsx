"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { calmMessage } from "@/lib/calm"

export function AcceptInviteButton({ inviteId, token }: { inviteId: string; token: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function accept() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/team/${inviteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error("This invitation couldn't be accepted. It may have expired or been sent to another email address.")
      window.location.href = data.learner_id ? `/journey/${data.learner_id}` : "/dashboard"
    } catch (err) {
      setError(calmMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={accept} disabled={busy}>
        {busy ? "Accepting..." : "Accept invitation"}
      </Button>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
