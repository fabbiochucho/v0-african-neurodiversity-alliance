"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Turnstile, TURNSTILE_SITE_KEY } from "@/components/turnstile"
import { useT } from "@/components/language-provider"

const input =
  "w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"

export default function ForgotPasswordPage() {
  const tr = useT()
  const [email, setEmail] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaKey, setCaptchaKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/update-password`,
      captchaToken: captchaToken ?? undefined,
    })
    setLoading(false)
    setCaptchaToken(null)
    setCaptchaKey((k) => k + 1)
    // Same message whether or not the email has an account, so the form doesn't reveal who's registered.
    if (error && !/user|not found/i.test(error.message)) return setError(error.message)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-foreground">{tr("auth.forgotTitle")}</h1>
        {sent ? (
          <p role="status">{tr("auth.resetSent")}</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-muted-foreground">{tr("auth.forgotIntro")}</p>
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              {tr("auth.email")}
            </label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
            <Turnstile key={captchaKey} onToken={setCaptchaToken} />
            <button
              type="submit"
              disabled={loading || (!!TURNSTILE_SITE_KEY && !captchaToken)}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition"
            >
              {tr("auth.sendResetLink")}
            </button>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </form>
        )}
        <p className="text-sm">
          <Link href="/auth/login" className="text-primary underline">
            {tr("auth.signIn")}
          </Link>
        </p>
      </div>
    </div>
  )
}
