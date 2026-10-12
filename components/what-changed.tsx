"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { compareSnapshots, SNAPSHOT_WINDOW_DAYS, type JourneySnapshot } from "@/lib/journey"

const DIRECTION_LABEL = { better: "Better", worse: "Lower", same: "About the same", new: "New area", dropped: "No recent check-ins" }

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })

/** Compare two progress snapshots; owners can also save a new one. */
export function WhatChanged({ learnerId, snapshots, canSave }: { learnerId: string; snapshots: JourneySnapshot[]; canSave: boolean }) {
  const router = useRouter()
  const sorted = [...snapshots].sort((a, b) => a.created_at.localeCompare(b.created_at))
  const [fromId, setFromId] = useState(sorted[sorted.length - 2]?.id ?? "")
  const [toId, setToId] = useState(sorted[sorted.length - 1]?.id ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = sorted.find((s) => s.id === fromId)
  const to = sorted.find((s) => s.id === toId)
  const rows = from && to && from.id !== to.id ? compareSnapshots(from, to) : []

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/progress/summary/${learnerId}`, { method: "POST" })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Couldn't save a snapshot")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save a snapshot")
    } finally {
      setSaving(false)
    }
  }

  const picker = (label: string, value: string, onChange: (v: string) => void) => (
    <label className="text-sm font-medium space-y-1">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-background">
        {sorted.map((s) => (
          <option key={s.id} value={s.id}>
            {fmt(s.created_at)}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        A snapshot records the average check-in rating in each area over the previous {SNAPSHOT_WINDOW_DAYS} days. Compare
        two to see what changed.
      </p>

      {sorted.length < 2 ? (
        <p className="text-sm">
          {sorted.length === 0 ? "No snapshots yet." : "One snapshot so far."} Save another after more check-ins to compare.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            {picker("From", fromId, setFromId)}
            {picker("To", toId, setToId)}
          </div>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pick two different snapshots.</p>
          ) : (
            <table className="w-full text-sm">
              <caption className="sr-only">Average rating per area, out of 5</caption>
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th scope="col" className="py-2 font-medium">Area</th>
                  <th scope="col" className="py-2 font-medium">Then</th>
                  <th scope="col" className="py-2 font-medium">Now</th>
                  <th scope="col" className="py-2 font-medium">What changed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.domain} className="border-b last:border-0">
                    <th scope="row" className="py-2 font-medium capitalize text-left">{r.domain}</th>
                    <td className="py-2">{r.before?.toFixed(1) ?? "-"}</td>
                    <td className="py-2">{r.after?.toFixed(1) ?? "-"}</td>
                    <td className="py-2">
                      {DIRECTION_LABEL[r.direction]}
                      {r.change !== null && r.direction !== "same" ? ` (${r.change > 0 ? "+" : ""}${r.change.toFixed(1)})` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {canSave && (
        <Button variant="outline" size="sm" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save a snapshot now"}
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
