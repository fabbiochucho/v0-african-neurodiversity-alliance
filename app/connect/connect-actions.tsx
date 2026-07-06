"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

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
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="bg-transparent"
          onClick={() => router.push("/protected")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button onClick={handleAccept} disabled={submitting} className="bg-[#3C9C87] hover:bg-[#2d7a6a]">
          {submitting ? "Connecting..." : "Connect Account"}
        </Button>
      </div>
    </div>
  )
}
