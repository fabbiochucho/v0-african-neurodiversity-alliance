"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { calmMessage } from "@/lib/calm"
import { MAX_QUESTION_CHARS } from "@/lib/reviewed-answers"

export function AskExpert({ question }: { question: string }) {
  const [text, setText] = useState(question)
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState<string | null>(null)
  const [crisis, setCrisis] = useState<string | null>(null)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setState("sending")
    setError(null)
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      setCrisis(typeof data.crisis === "string" ? data.crisis : null)
      setState("sent")
    } catch (err) {
      setState("idle")
      setError(calmMessage(err))
    }
  }

  if (state === "sent") {
    return (
      <div className="space-y-3">
      {crisis && (
        <div role="alert" className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-4 text-sm whitespace-pre-wrap">
          {crisis}
        </div>
      )}
      <p role="status" className="text-sm">
        Sent. An ANDA expert will reply, usually within a few working days. We&apos;ll email you when they do, and
        you can read it under{" "}
        <Link href="/ask/mine" className="text-primary underline">
          your questions
        </Link>
        .
      </p>
      </div>
    )
  }

  return (
    <form onSubmit={send} className="space-y-2">
      <label htmlFor="expert-q" className="text-sm font-medium">
        Question for an expert
      </label>
      <textarea
        id="expert-q"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={MAX_QUESTION_CHARS}
        rows={4}
        className="w-full px-3 py-2 border rounded-lg bg-background"
      />
      <p className="text-xs text-muted-foreground">
        Add any detail that helps (an age range, the setting), but no names or health records. ANDA keeps your question
        so an expert can answer it.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={state === "sending" || text.trim().length < 5}>
        Send to an expert
      </Button>
    </form>
  )
}

export function AnswerFeedback({ id }: { id: string }) {
  const [sent, setSent] = useState(false)

  async function rate(helpful: boolean) {
    setSent(true)
    await fetch("/api/ask/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, helpful }),
    }).catch(() => undefined)
  }

  if (sent) return <p role="status" className="text-xs text-muted-foreground">Thank you.</p>
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">Did this help?</span>
      <Button type="button" size="sm" variant="outline" onClick={() => rate(true)}>
        Yes
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => rate(false)}>
        No
      </Button>
    </div>
  )
}
