"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Setup = { factorId: string; qr: string; secret: string }

export function AdminVerify() {
  const router = useRouter()
  const [factorId, setFactorId] = useState<string | null>(null)
  const [setup, setSetup] = useState<Setup | null>(null)
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) return setError("Couldn't load your 2FA settings. Reload the page.")
      const verified = data.totp.find((f) => f.status === "verified")
      if (verified) return setFactorId(verified.id)
      // First time: drop any half-finished setup, then start a new one.
      for (const f of data.all.filter((f) => f.factor_type === "totp" && f.status === "unverified")) {
        await supabase.auth.mfa.unenroll({ factorId: f.id })
      }
      const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `ANDA admin ${new Date().toISOString().slice(0, 10)}`,
      })
      if (enrollError || !enrolled) return setError("Couldn't start 2FA setup. Reload the page.")
      setFactorId(enrolled.id)
      setSetup({ factorId: enrolled.id, qr: enrolled.totp.qr_code, secret: enrolled.totp.secret })
    })()
  }, [])

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    if (!factorId) return
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() })
    if (error) {
      setBusy(false)
      setCode("")
      return setError("That code didn't work. Check your app and try the newest code.")
    }
    const res = await fetch("/api/admin/session", { method: "POST" })
    setBusy(false)
    if (!res.ok) return setError("Signed in, but the admin session didn't start. Try again.")
    router.replace("/admin")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {setup && (
        <div className="space-y-3 rounded-lg border p-4">
          <p className="font-medium">Set up 2FA (once)</p>
          <ol className="list-decimal pl-5 text-sm space-y-1 text-muted-foreground">
            <li>Open your authenticator app and add an account.</li>
            <li>Scan this code, or type the key below.</li>
            <li>Enter the 6-digit code the app shows.</li>
          </ol>
          {/* eslint-disable-next-line @next/next/no-img-element -- data: URL from Supabase */}
          <img src={setup.qr} alt="QR code for your authenticator app" width={180} height={180} className="bg-white p-2 rounded" />
          <p className="text-sm">
            Key: <code className="break-all select-all">{setup.secret}</code>
          </p>
        </div>
      )}

      <form onSubmit={verify} className="space-y-3">
        <Label htmlFor="totp">6-digit code</Label>
        <Input
          id="totp"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
          disabled={!factorId}
        />
        <Button type="submit" disabled={busy || code.length !== 6 || !factorId}>
          {busy ? "Checking…" : "Continue"}
        </Button>
      </form>

      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    </div>
  )
}
