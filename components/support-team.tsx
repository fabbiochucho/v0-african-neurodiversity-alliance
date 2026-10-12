"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ROLE_DESCRIPTIONS, SUPPORT_ROLES, type SupportRole, type SupportTeamMember } from "@/lib/support-team"

function useAction() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(url: string, init: RequestInit): Promise<{ emailSent?: boolean; link?: string } | null> {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      router.refresh()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      return null
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, run }
}

/** Owner view: who's on this person's team, and invite someone new. */
export function TeamManager({
  learnerId,
  members,
  emailConfigured,
}: {
  learnerId: string
  members: SupportTeamMember[]
  emailConfigured: boolean
}) {
  const { busy, error, run } = useAction()
  const [notice, setNotice] = useState<{ text: string; link?: string } | null>(null)

  function report(result: { emailSent?: boolean; link?: string } | null, email: string) {
    if (!result) return
    setNotice(
      result.emailSent
        ? { text: `Invitation emailed to ${email}.` }
        : {
            text: "Invite emails aren't set up on this site, so no email was sent. Share this link with them yourself (it expires in 7 days):",
            link: result.link,
          },
    )
  }
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
                {m.status === "pending" && (
                  <span className="text-muted-foreground">
                    {" "}
                    ·{" "}
                    {m.invite_expires_at && new Date(m.invite_expires_at) <= new Date()
                      ? "invite expired"
                      : "invited, not yet accepted"}
                  </span>
                )}
              </span>
              <span className="flex gap-1">
                {m.status === "pending" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={async () =>
                      report(await run(`/api/team/${m.id}`, { method: "POST", body: JSON.stringify({ action: "resend" }) }), m.invited_email)
                    }
                  >
                    Resend
                  </Button>
                )}
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(`/api/team/${m.id}`, { method: "DELETE" })}>
                  {m.status === "pending" ? "Revoke" : "Remove"}
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <form
        className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end"
        onSubmit={async (e) => {
          e.preventDefault()
          const result = await run("/api/team", { method: "POST", body: JSON.stringify({ learner_id: learnerId, email, role }) })
          if (result) {
            report(result, email)
            setEmail("")
          }
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
      <p className="text-xs text-muted-foreground">
        {ROLE_DESCRIPTIONS[role]}{" "}
        {emailConfigured
          ? "We'll email them a link that expires in 7 days. They sign in with that email address to accept."
          : "Invite emails aren't set up on this site yet: you'll get a link to share yourself, and they can also accept from their dashboard after signing in with this email."}
      </p>
      {notice && (
        <div role="status" className="rounded-lg border p-3 text-sm space-y-1">
          <p>{notice.text}</p>
          {notice.link && <code className="block break-all text-xs">{notice.link}</code>}
        </div>
      )}
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
