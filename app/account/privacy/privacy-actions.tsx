"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function WithdrawButton({ label, url, method, body }: { label: string; url: string; method: string; body?: object }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError(null)
          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
          }).catch(() => null)
          setBusy(false)
          if (res?.ok) router.refresh()
          else setError("That didn't work. Try again.")
        }}
      >
        {label}
      </Button>
      {error && (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      )}
    </span>
  )
}

export function DeleteAccount({ email }: { email: string }) {
  const [step, setStep] = useState<"start" | "confirm">("start")
  const [typed, setTyped] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (step === "start") {
    return (
      <Button variant="outline" onClick={() => setStep("confirm")}>
        Delete my account
      </Button>
    )
  }

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError(null)
        const res = await fetch("/api/account/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: typed }),
        }).catch(() => null)
        if (res?.ok) {
          window.location.href = "/?account=deleted"
          return
        }
        const data = await res?.json().catch(() => ({}))
        setError(data?.error || "Your account wasn't deleted. Your information is still here. Try again.")
        setBusy(false)
      }}
    >
      <label className="block text-sm space-y-1">
        <span>
          To confirm, type your email address: <strong>{email}</strong>
        </span>
        <input
          type="email"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          className="w-full px-3 py-2 border rounded-lg bg-background"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" disabled={busy || typed.trim().toLowerCase() !== email.toLowerCase()}>
          {busy ? "Deleting..." : "Permanently delete my account"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setStep("start")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
