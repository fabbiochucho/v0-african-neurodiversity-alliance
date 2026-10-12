"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { contrastWithWhite, type Branding } from "@/lib/branding"

export function BrandingForm({ initial }: { initial: Branding | null }) {
  const router = useRouter()
  const [accent, setAccent] = useState(initial?.accentColor ?? "#2a7a69")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const ratio = /^#[0-9a-fA-F]{6}$/.test(accent) ? contrastWithWhite(accent) : 0

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setMessage(null)
        try {
          const res = await fetch("/api/branding", { method: "POST", body: new FormData(e.currentTarget) })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data.error || "Couldn't save")
          setMessage({ ok: true, text: "Saved. New reports and report emails will use this branding." })
          router.refresh()
        } catch (err) {
          setMessage({ ok: false, text: err instanceof Error ? err.message : "Couldn't save" })
        } finally {
          setBusy(false)
        }
      }}
    >
      <label className="block text-sm font-medium space-y-1">
        <span>Organisation name</span>
        <input name="org_name" defaultValue={initial?.orgName ?? ""} maxLength={120} className="w-full px-3 py-2 border rounded-lg bg-background" />
      </label>

      <div className="space-y-1 text-sm">
        <label htmlFor="accent" className="font-medium">
          Accent colour
        </label>
        <div className="flex items-center gap-3">
          <input id="accent" name="accent_color" type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-10 w-16 rounded border" />
          <span className="rounded px-3 py-1 text-white" style={{ background: accent }}>
            Report header
          </span>
          <span className={ratio >= 4.5 ? "text-muted-foreground" : "text-destructive"}>
            Contrast with white {ratio.toFixed(1)}:1 {ratio >= 4.5 ? "(passes AA)" : "(too light, needs 4.5:1)"}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <label htmlFor="logo" className="font-medium block">
          Logo (PNG, JPEG or WebP, up to 512 KB)
        </label>
        {initial?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={initial.logoUrl} alt="Current logo" className="max-h-14" />
        )}
        <input id="logo" name="logo" type="file" accept="image/png,image/jpeg,image/webp" />
        {initial?.logoUrl && (
          <label className="flex items-center gap-2">
            <input type="checkbox" name="remove_logo" value="1" /> Remove current logo
          </label>
        )}
      </div>

      <Button type="submit" disabled={busy || ratio < 4.5}>
        {busy ? "Saving..." : "Save branding"}
      </Button>
      {message && (
        <p role={message.ok ? "status" : "alert"} className={`text-sm ${message.ok ? "text-primary" : "text-destructive"}`}>
          {message.text}
        </p>
      )}
    </form>
  )
}
