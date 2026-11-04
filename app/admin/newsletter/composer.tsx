"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Mode = "preview" | "test" | "all"

export function NewsletterComposer({ activeCount }: { activeCount: number }) {
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState<Mode | null>(null)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  async function run(mode: Mode) {
    setBusy(mode)
    setStatus(null)
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, mode, confirm }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return setStatus({ ok: false, text: data.error ?? "Something went wrong." })
      if (mode === "preview") return setPreview(data.html)
      setStatus({ ok: true, text: data.message })
      if (mode === "all") {
        setSubject("")
        setBody("")
        setConfirm("")
        setPreview(null)
        router.refresh()
      }
    } finally {
      setBusy(null)
    }
  }

  const ready = Boolean(subject.trim() && body.trim()) && !busy

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nl-subject">Subject</Label>
        <Input id="nl-subject" value={subject} maxLength={200} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nl-body">Text</Label>
        <Textarea id="nl-body" value={body} rows={14} onChange={(e) => setBody(e.target.value)} aria-describedby="nl-body-help" />
        <p id="nl-body-help" className="text-xs text-muted-foreground">
          Leave a blank line between paragraphs. Start a line with &quot;## &quot; for a heading, or &quot;- &quot; for a
          list. Web addresses become links. Partner news and offers are fine here: subscribers agreed to them, and their
          details are never given to the partner.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={!ready} onClick={() => run("preview")}>
          {busy === "preview" ? "Loading…" : "Preview"}
        </Button>
        <Button type="button" variant="outline" disabled={!ready} onClick={() => run("test")}>
          {busy === "test" ? "Sending…" : "Send a test to me"}
        </Button>
      </div>

      {preview && (
        <iframe title="Newsletter preview" srcDoc={preview} sandbox="" className="w-full h-[600px] rounded-lg border bg-white" />
      )}

      <div className="rounded-lg border border-destructive/40 p-4 space-y-3">
        <p className="text-sm">
          Send to all <strong>{activeCount}</strong> active subscriber{activeCount === 1 ? "" : "s"}. This can&apos;t be
          undone. Type <strong>SEND</strong> to confirm.
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <Input aria-label="Type SEND to confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="max-w-[10rem]" />
          <Button
            type="button"
            variant="destructive"
            disabled={!ready || confirm !== "SEND" || activeCount === 0}
            onClick={() => run("all")}
          >
            {busy === "all" ? "Sending…" : "Send newsletter"}
          </Button>
        </div>
      </div>

      <p role="status" aria-live="polite" className={status?.ok ? "text-sm text-primary" : "text-sm text-destructive"}>
        {status?.text}
      </p>
    </div>
  )
}
