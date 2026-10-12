"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MAX_MESSAGE_CHARS, type ChatTurn } from "@/lib/companion"

export function CompanionChat() {
  // Conversation lives only in this component's memory.
  const [turns, setTurns] = useState<(ChatTurn & { crisis?: boolean })[]>([])
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || busy) return

    const next = [...turns, { role: "user" as const, content: text }]
    setTurns(next)
    setDraft("")
    setBusy(true)
    setError(null)

    try {
      const res = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      setTurns([...next, { role: "assistant", content: data.reply, crisis: data.crisis }])
      if (typeof data.remainingToday === "number") setRemaining(data.remainingToday)
    } catch (err) {
      setTurns(turns)
      setDraft(text)
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-label="Conversation" className="space-y-4">
      <ol aria-live="polite" className="space-y-3">
        {turns.map((turn, i) => (
          <li
            key={i}
            className={`rounded-lg p-4 text-sm whitespace-pre-wrap ${
              turn.role === "user"
                ? "bg-secondary ml-8"
                : turn.crisis
                  ? "border-2 border-destructive/40 bg-destructive/5 mr-8"
                  : "border bg-card mr-8"
            }`}
          >
            <span className="sr-only">{turn.role === "user" ? "You said:" : "Companion said:"}</span>
            {turn.content}
          </li>
        ))}
        {busy && <li className="text-sm text-muted-foreground">Thinking...</li>}
      </ol>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={send} className="space-y-2">
        <label htmlFor="companion-input" className="text-sm font-medium">
          Your message
        </label>
        <textarea
          id="companion-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_MESSAGE_CHARS}
          rows={3}
          placeholder="e.g. How can we make mornings before school calmer?"
          className="w-full px-3 py-2 border rounded-lg bg-background"
        />
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">
            {remaining !== null ? `${remaining} messages left today` : "Please don't share names or health records."}
          </span>
          <Button type="submit" disabled={busy || !draft.trim()}>
            Send
          </Button>
        </div>
      </form>
    </section>
  )
}
