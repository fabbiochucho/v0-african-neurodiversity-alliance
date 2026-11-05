"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useT } from "@/components/language-provider"
import { isStrongPassword } from "@/lib/password"

const input =
  "w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"

// Landing page for password-reset links. A link from "Forgot password" arrives with ?code=
// (PKCE, same browser); a link a staff member sent arrives with the session in the #fragment.
export default function UpdatePasswordPage() {
  const tr = useT()
  const router = useRouter()
  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const code = new URLSearchParams(window.location.search).get("code")
      const hash = new URLSearchParams(window.location.hash.slice(1))
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) return setReady("invalid")
      } else if (hash.get("access_token") && hash.get("refresh_token")) {
        const { error } = await supabase.auth.setSession({
          access_token: hash.get("access_token")!,
          refresh_token: hash.get("refresh_token")!,
        })
        if (error) return setReady("invalid")
      }
      window.history.replaceState(null, "", window.location.pathname)
      const { data } = await supabase.auth.getUser()
      setReady(data.user ? "ok" : "invalid")
    })()
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!isStrongPassword(password)) return setError(tr("auth.passwordTooWeak"))
    if (password !== confirm) return setError(tr("auth.passwordsDontMatch"))
    setBusy(true)
    setError(null)
    const { error } = await createClient().auth.updateUser({ password })
    setBusy(false)
    if (error) return setError(error.message)
    router.push("/dashboard?password=changed")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-foreground">{tr("auth.newPasswordTitle")}</h1>
        {ready === "invalid" && (
          <p role="alert">
            {tr("auth.resetLinkInvalid")}{" "}
            <Link href="/auth/forgot-password" className="text-primary underline">
              {tr("auth.forgotPassword")}
            </Link>
          </p>
        )}
        {ready === "ok" && (
          <form onSubmit={save} className="space-y-4">
            <label htmlFor="password" className="text-sm font-medium text-foreground block">
              {tr("auth.newPassword")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="password-hint"
              className={input}
            />
            <p id="password-hint" className="text-xs text-muted-foreground">
              {tr("auth.passwordHint")}
            </p>
            <label htmlFor="confirm" className="text-sm font-medium text-foreground block">
              {tr("auth.confirmPassword")}
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={input}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition"
            >
              {tr("auth.saveNewPassword")}
            </button>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
