"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ROLE_DESCRIPTIONS, SUPPORT_ROLES, type SupportRole, type SupportTeamMember } from "@/lib/support-team"

function useAction() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(url: string, init: RequestInit): Promise<boolean> {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Something went wrong")
      router.refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      return false
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, run }
}

/** Owner view: who's on this person's team, and invite someone new. */
export function TeamManager({ learnerId, members }: { learnerId: string; members: SupportTeamMember[] }) {
  const { busy, error, run } = useAction()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<SupportRole>("caregiver")

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">No one else is on this team yet.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
              <span>
                {m.invited_email} · <span className="capitalize">{m.role}</span>
                {m.status === "pending" && <span className="text-muted-foreground"> · invited, not yet accepted</span>}
              </span>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(`/api/team/${m.id}`, { method: "DELETE" })}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end"
        onSubmit={async (e) => {
          e.preventDefault()
          if (await run("/api/team", { method: "POST", body: JSON.stringify({ learner_id: learnerId, email, role }) })) setEmail("")
        }}
      >
        <label className="text-sm font-medium space-y-1">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-background"
            placeholder="teacher@example.com"
          />
        </label>
        <label className="text-sm font-medium space-y-1">
          <span>Role</span>
          <select value={role} onChange={(e) => setRole(e.target.value as SupportRole)} className="w-full px-3 py-2 border rounded-lg bg-background capitalize">
            {SUPPORT_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" disabled={busy || !email}>
          Invite
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]} They accept the invite from their own ANDA dashboard after signing in with this email.</p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

/** Invitee view: pending invites addressed to the signed-in user's email. */
export function PendingInvites({ invites }: { invites: SupportTeamMember[] }) {
  const { busy, error, run } = useAction()
  if (invites.length === 0) return null

  return (
    <section aria-labelledby="invites-heading" className="rounded-lg border border-primary/30 bg-primary/5 p-6 space-y-3">
      <h2 id="invites-heading" className="text-lg font-semibold">
        Support team invitations
      </h2>
      <ul className="space-y-2">
        {invites.map((inv) => (
          <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              Join <strong>{inv.learner_name}</strong>&apos;s support team as a <span className="capitalize">{inv.role}</span>.{" "}
              <span className="text-muted-foreground">{ROLE_DESCRIPTIONS[inv.role]}</span>
            </span>
            <Button size="sm" disabled={busy} onClick={() => run(`/api/team/${inv.id}`, { method: "POST" })}>
              Accept
            </Button>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  )
}
