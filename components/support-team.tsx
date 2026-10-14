"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { describePermissions, roleLabel, type SupportTeamMember } from "@/lib/support-team"
import {
  isMinor,
  MINOR_RESTRICTED,
  PERMISSION_LABELS,
  PERMISSIONS,
  PRESET_LABELS,
  PRESET_PERMISSIONS,
  PRESETS,
  isPreset,
  type Permission,
  type Preset,
} from "@/lib/team-permissions"

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
      if (!res.ok) throw new Error(data.error || "Something didn't save. Try again.")
      router.refresh()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something didn't save. Try again.")
      return null
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, run }
}

function PermissionPicker({
  preset,
  permissions,
  onChange,
  minor,
}: {
  preset: Preset
  permissions: Permission[]
  onChange: (preset: Preset, permissions: Permission[]) => void
  minor: boolean
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium space-y-1">
        <span>Role</span>
        <select
          value={preset}
          onChange={(e) => {
            const p = e.target.value as Preset
            onChange(p, PRESET_PERMISSIONS[p])
          }}
          className="w-full px-3 py-2 border rounded-lg bg-background"
        >
          {PRESETS.map((p) => (
            <option key={p} value={p}>
              {PRESET_LABELS[p]}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="text-sm font-medium mb-1">What they can do</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
          {PERMISSIONS.map((p) => (
            <label key={p} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={permissions.includes(p)}
                disabled={p === "view"}
                onChange={(e) =>
                  onChange(preset, e.target.checked ? [...permissions, p] : permissions.filter((x) => x !== p))
                }
              />
              {PERMISSION_LABELS[p]}
              {minor && MINOR_RESTRICTED.includes(p) && <span className="text-xs text-muted-foreground">(only you can grant this)</span>}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

/** Owner view: who's on this person's team, what each can do, and invites. */
export function TeamManager({
  learnerId,
  members,
  emailConfigured,
  learnerAge,
}: {
  learnerId: string
  members: SupportTeamMember[]
  emailConfigured: boolean
  learnerAge: number | null
}) {
  const { busy, error, run } = useAction()
  const [notice, setNotice] = useState<{ text: string; link?: string } | null>(null)
  const [email, setEmail] = useState("")
  const [preset, setPreset] = useState<Preset>("teacher")
  const [permissions, setPermissions] = useState<Permission[]>(PRESET_PERMISSIONS.teacher)
  const [editing, setEditing] = useState<{ id: string; preset: Preset; permissions: Permission[] } | null>(null)
  const minor = isMinor(learnerAge)

  function report(result: { emailSent?: boolean; link?: string } | null, to: string) {
    if (!result) return
    setNotice(
      result.emailSent
        ? { text: `Invitation emailed to ${to}.` }
        : {
            text: "Invite emails aren't set up on this site, so no email was sent. Share this link with them yourself (it expires in 7 days):",
            link: result.link,
          },
    )
  }

  return (
    <div className="space-y-4">
      {minor && (
        <p className="text-sm text-muted-foreground">
          As the learner is under 18 (or their age isn&apos;t recorded), only you can give someone approve, manage plan,
          invite or export rights.
        </p>
      )}
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">No one else is on this team yet.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="rounded-lg border p-3 text-sm space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {m.invited_email} · {roleLabel(m.role)}
                  {m.status === "pending" && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {m.invite_expires_at && new Date(m.invite_expires_at) <= new Date() ? "invite expired" : "invited, not yet accepted"}
                    </span>
                  )}
                </span>
                <span className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() =>
                      setEditing(
                        editing?.id === m.id
                          ? null
                          : { id: m.id, preset: isPreset(m.role) ? m.role : "other_professional", permissions: m.permissions ?? ["view"] },
                      )
                    }
                  >
                    Permissions
                  </Button>
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
              </div>
              <p className="text-muted-foreground">{describePermissions(m.permissions)}</p>
              {editing?.id === m.id && (
                <div className="space-y-2 border-t pt-2">
                  <PermissionPicker
                    preset={editing.preset}
                    permissions={editing.permissions}
                    minor={minor}
                    onChange={(p, perms) => setEditing({ id: m.id, preset: p, permissions: perms })}
                  />
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={async () => {
                      if (
                        await run(`/api/team/${m.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ preset: editing.preset, permissions: editing.permissions }),
                        })
                      )
                        setEditing(null)
                    }}
                  >
                    Save permissions
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form
        className="space-y-3 rounded-lg border p-4"
        onSubmit={async (e) => {
          e.preventDefault()
          const result = await run("/api/team", {
            method: "POST",
            body: JSON.stringify({ learner_id: learnerId, email, preset, permissions }),
          })
          if (result) {
            report(result, email)
            setEmail("")
          }
        }}
      >
        <h3 className="font-semibold">Invite someone</h3>
        <label className="block text-sm font-medium space-y-1">
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
        <PermissionPicker
          preset={preset}
          permissions={permissions}
          minor={minor}
          onChange={(p, perms) => {
            setPreset(p)
            setPermissions(perms)
          }}
        />
        <p className="text-xs text-muted-foreground">
          {emailConfigured
            ? "We'll email them a link that expires in 7 days. They sign in with that email address to accept."
            : "Invite emails aren't set up on this site yet: you'll get a link to share yourself, and they can also accept from their dashboard after signing in with this email."}
        </p>
        <Button type="submit" disabled={busy || !email}>
          Invite
        </Button>
      </form>
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
              Join <strong>{inv.learner_name}</strong>&apos;s support team as {roleLabel(inv.role)}.{" "}
              <span className="text-muted-foreground">{describePermissions(inv.permissions)}</span>
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
