"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { SupportTeamMember } from "@/lib/support-team"
import { calmMessage } from "@/lib/calm"

/** Resend pending invites, or remove this person from every team they're on. */
export function StaffActions({ memberships }: { memberships: SupportTeamMember[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const pending = memberships.filter((m) => m.status === "pending")

  async function call(url: string, init: RequestInit) {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || "Something went wrong")
    return data
  }

  async function run(action: () => Promise<string>) {
    setBusy(true)
    setMessage(null)
    try {
      setMessage(await action())
      router.refresh()
    } catch (err) {
      setMessage(calmMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1">
        {pending.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() =>
              run(async () => {
                const results = await Promise.all(
                  pending.map((m) => call(`/api/team/${m.id}`, { method: "POST", body: JSON.stringify({ action: "resend" }) })),
                )
                return results.every((r) => r.emailSent)
                  ? "Invitation re-sent."
                  : "Email isn't set up, so nothing was sent. Re-send from the learner's journey page to get a link to share."
              })
            }
          >
            Resend invite
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() =>
            run(async () => {
              await Promise.all(memberships.map((m) => call(`/api/team/${m.id}`, { method: "DELETE" })))
              return "Removed."
            })
          }
        >
          Remove from all teams
        </Button>
      </div>
      {message && (
        <p role="status" className="text-xs text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  )
}
