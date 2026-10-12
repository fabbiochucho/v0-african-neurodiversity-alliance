"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DigestSignup() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState("sending")
    const res = await fetch("/api/digest/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null)
    const body = await res?.json().catch(() => null)
    if (res?.ok) {
      setState("done")
      setMessage(body?.message ?? "Check your inbox to confirm your subscription.")
      setEmail("")
    } else {
      setState("error")
      setMessage(body?.error ?? "Couldn't subscribe right now. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Label htmlFor="digest-email">Get the weekly digest</Label>
      <p className="text-sm text-muted-foreground">
        One email a week: news from across Africa, new open-access research, and new support organisations.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          id="digest-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Subscribing…" : "Subscribe"}
        </Button>
      </div>
      {message && (
        <p role="status" className={`text-sm ${state === "error" ? "text-destructive" : "text-primary"}`}>
          {message}
        </p>
      )}
    </form>
  )
}
