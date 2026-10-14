"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { calmMessage } from "@/lib/calm"

export function ConnectActions({ token }: { token: string }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAccept() {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/federation/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to connect account")
      }

      router.push("/settings/connections")
    } catch (err) {
      setError(calmMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">{error}</div>
      )}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="bg-transparent"
          onClick={() => router.push("/dashboard")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button onClick={handleAccept} disabled={submitting} className="bg-primary hover:bg-primary/90">
          {submitting ? "Connecting..." : "Connect Account"}
        </Button>
      </div>
    </div>
  )
}
