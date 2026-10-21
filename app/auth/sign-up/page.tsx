"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Icons } from "@/lib/icons"
import { Turnstile, TURNSTILE_SITE_KEY } from "@/components/turnstile"
import { useT } from "@/components/language-provider"
import { LEGAL_UPDATED } from "@/lib/legal"

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaKey, setCaptchaKey] = useState(0)
  const router = useRouter()
  const supabase = createClient()
  const tr = useT()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(tr("auth.passwordsDontMatch"))
      return
    }

    if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*()_+\-=[\]{};'\:"|<>?,./`~]/.test(password)) {
      setError(tr("auth.passwordTooWeak"))
      return
    }

    setLoading(true)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken: captchaToken ?? undefined,
          data: {
            first_name: firstName,
            last_name: lastName,
            // Which version of the terms and privacy policy this person agreed to.
            terms_version: LEGAL_UPDATED,
            terms_accepted_at: new Date().toISOString(),
          },
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/sign-up-success`,
        },
      })

      if (signUpError) {
        setCaptchaToken(null)
        setCaptchaKey((k) => k + 1)
        setError(signUpError.message)
        setLoading(false)
        return
      }

      router.push("/auth/sign-up-success")
    } catch (err) {
      setError(tr("auth.genericError"))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-terracotta bg-clip-text text-transparent">
              ANDA
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{tr("auth.join")}</h1>
          <p className="text-muted-foreground">{tr("auth.joinIntro")}</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
              <Icons.AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                {tr("auth.firstName")}
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                {tr("auth.lastName")}
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              {tr("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              {tr("auth.password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={12}
              aria-describedby="password-hint"
              required
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p id="password-hint" className="text-xs text-muted-foreground">
              {tr("auth.passwordHint")}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              {tr("auth.confirmPassword")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <Turnstile key={captchaKey} onToken={setCaptchaToken} />

          <p className="text-xs text-muted-foreground">
            {tr("auth.agreeStart")}{" "}
            <Link href="/terms" className="underline">
              {tr("auth.agreeTerms")}
            </Link>{" "}
            {tr("auth.agreeAnd")}{" "}
            <Link href="/privacy" className="underline">
              {tr("auth.agreePrivacy")}
            </Link>
            .
          </p>

          <button
            type="submit"
            disabled={loading || (!!TURNSTILE_SITE_KEY && !captchaToken)}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {loading ? tr("auth.creatingAccount") : tr("auth.createAccount")}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-input"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">{tr("auth.haveAccount")}</span>
          </div>
        </div>

        <Link
          href="/auth/login"
          className="block w-full text-center py-2 px-4 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition"
        >
          {tr("auth.signIn")}
        </Link>
      </div>
    </div>
  )
}
