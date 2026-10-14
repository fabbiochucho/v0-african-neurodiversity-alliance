"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { BulkReport } from "@/lib/bulk-enrollment"
import { calmMessage } from "@/lib/calm"

type Result = BulkReport & { inserted: number }

export function BulkImport({ remaining, limit }: { remaining: number; limit: number }) {
  const [csv, setCsv] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(dryRun: boolean) {
    if (!csv) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/learners/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, dry_run: dryRun }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Import failed")
      setResult(data)
    } catch (err) {
      setError(calmMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5 text-sm">
      <ol className="list-decimal pl-5 space-y-1">
        <li>
          <a href="/api/learners/bulk" className="text-primary hover:underline">
            Download the CSV template
          </a>{" "}
          (columns: name, age, gender, country, support_areas separated by semicolons).
        </li>
        <li>Fill it in, one learner per row, and upload it below.</li>
        <li>Check the report, then import the valid rows.</li>
      </ol>
      <p className="text-muted-foreground">
        You can add {remaining} more learner{remaining === 1 ? "" : "s"} on your plan (limit {limit}). Rows beyond that are
        reported, not added.
      </p>

      <input
        type="file"
        accept=".csv,text/csv"
        aria-label="CSV file"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          setResult(null)
          setCsv(file ? await file.text() : null)
          setFileName(file?.name ?? "")
        }}
      />

      <div className="flex gap-2">
        <Button variant="outline" disabled={!csv || busy} onClick={() => submit(true)}>
          Check file
        </Button>
        <Button disabled={!csv || busy || !result || result.inserted > 0 || result.valid.length === 0} onClick={() => submit(false)}>
          Import {result && result.inserted === 0 ? result.valid.length : ""} valid row{result?.valid.length === 1 ? "" : "s"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}

      {result && (
        <div role="status" className="space-y-3 rounded-lg border p-4">
          <p>
            <strong>{fileName}</strong>: {result.valid.length} valid row{result.valid.length === 1 ? "" : "s"},{" "}
            {result.errors.length} with problems.
            {result.inserted > 0 && ` ${result.inserted} learner${result.inserted === 1 ? "" : "s"} added.`}
          </p>
          {result.errors.length > 0 && (
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th scope="col" className="py-1 pr-4 font-medium">Row</th>
                  <th scope="col" className="py-1 font-medium">Problem</th>
                </tr>
              </thead>
              <tbody>
                {result.errors.map((e) => (
                  <tr key={e.row} className="border-b last:border-0">
                    <td className="py-1 pr-4">{e.row}</td>
                    <td className="py-1">{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
