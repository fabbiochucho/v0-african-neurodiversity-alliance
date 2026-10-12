"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const RATING_LABELS = ["", "Not yet", "Emerging", "Developing", "Mostly", "Consistently"]

/** Log a 1-5 check-in against a goal, or mark it achieved. */
export function GoalCheckIn({ goalId, canMarkAchieved = true }: { goalId: string; canMarkAchieved?: boolean }) {
  const router = useRouter()
  const [rating, setRating] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send(url: string, method: string, body: object) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Something went wrong")
      setRating(null)
      setNotes("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (rating) send("/api/progress/log", "POST", { goal_id: goalId, rating, notes: notes || null })
      }}
    >
      <fieldset>
        <legend className="text-sm font-medium mb-2">How did it go?</legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                rating === n ? "border-primary bg-primary/10" : ""
              }`}
            >
              <input
                type="radio"
                name={`rating-${goalId}`}
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="sr-only"
              />
              {n} · {RATING_LABELS[n]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm">
        <span className="sr-only">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you notice? (optional)"
          rows={2}
          className="w-full px-3 py-2 border rounded-lg bg-background"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={busy || !rating} className="bg-primary hover:bg-primary/90">
          {busy ? "Saving..." : "Save check-in"}
        </Button>
        {canMarkAchieved && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => send(`/api/iep/goals/${goalId}`, "PUT", { status: "achieved" })}
          >
            Mark achieved
          </Button>
        )}
      </div>
    </form>
  )
}
