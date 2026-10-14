"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { calmMessage } from "@/lib/calm"

export function ConsentButtons({ learnerId, active }: { learnerId: string; active: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function record(action: "granted" | "revoked") {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/companion/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learner_id: learnerId, action }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Couldn't save your choice")
      router.refresh()
    } catch (err) {
      setError(calmMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      {active ? (
        <Button variant="outline" disabled={busy} onClick={() => record("revoked")}>
          Withdraw consent and stop sharing
        </Button>
      ) : (
        <Button disabled={busy} onClick={() => record("granted")}>
          I agree to share this information
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
