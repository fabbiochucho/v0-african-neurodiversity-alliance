"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/** Daily micro-log (brief §21): one tap per goal for today, no typing needed. */
export function MicroLog({ goals, loggedToday }: { goals: { id: string; goal_text: string }[]; loggedToday: string[] }) {
  const router = useRouter()
  const [done, setDone] = useState<Set<string>>(new Set(loggedToday))
  const [error, setError] = useState<string | null>(null)

  async function log(goalId: string, rating: number) {
    setError(null)
    const res = await fetch("/api/progress/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal_id: goalId, rating, notes: null }),
    }).catch(() => null)
    if (res?.ok) {
      setDone(new Set(done).add(goalId))
      router.refresh()
    } else setError("That didn't save. Try again.")
  }

  if (goals.length === 0) return null
  return (
    <div className="space-y-2 text-sm">
      {goals.map((g) => (
        <div key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2">
          <span>{g.goal_text}</span>
          {done.has(g.id) ? (
            <span className="text-muted-foreground">Logged today</span>
          ) : (
            <span className="flex gap-1" role="group" aria-label={`How did "${g.goal_text}" go today?`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => log(g.id, n)} className="h-8 w-8 rounded-md border hover:bg-accent" aria-label={`${n} out of 5`}>
                  {n}
                </button>
              ))}
            </span>
          )}
        </div>
      ))}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
