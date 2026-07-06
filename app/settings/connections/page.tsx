"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { isFederationEnabled, getSiblingAppUrl, describeScope } from "@/lib/federation/config"

// Row shape returned from public.linked_accounts (see
// scripts/010_create_linked_accounts.sql).
interface LinkedAccount {
  id: string
  local_user_id: string
  remote_app: "alliance" | "neurafiki"
  remote_user_id: string
  remote_email: string | null
  status: "pending" | "active" | "revoked"
  scopes: string[]
  consent_version: string
  created_at: string
  revoked_at: string | null
}

const REMOTE_APP_LABELS: Record<string, string> = {
  neurafiki: "Neu Rafiki",
  alliance: "Alliance",
}

export default function ConnectionsSettingsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<LinkedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const federationEnabled = isFederationEnabled()

  async function loadAccounts() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login?redirect=/settings/connections")
      return
    }

    const { data } = await supabase
      .from("linked_accounts")
      .select("*")
      .order("created_at", { ascending: false })

    setAccounts((data as LinkedAccount[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  async function handleConnect() {
    setConnecting(true)
    setError(null)

    try {
      const res = await fetch("/api/federation/link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scopes: ["assessment_sync", "directory_read"] }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to start connection")
      }

      const siblingUrl = getSiblingAppUrl()
      window.location.href = `${siblingUrl}/connect?token=${encodeURIComponent(data.token)}`
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start connection")
      setConnecting(false)
    }
  }

  async function handleRevoke(id: string) {
    setRevokingId(id)
    setError(null)

    try {
      const res = await fetch(`/api/federation/link/${id}`, { method: "PATCH" })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to revoke connection")
      }

      setAccounts((prev) => prev.map((a) => (a.id === id ? (data as LinkedAccount) : a)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke connection")
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-balance mb-2">Connected Accounts</h1>
            <p className="text-muted-foreground">
              Optionally link your Alliance account to Neu Rafiki so completed assessment results can be imported
              into an IEP learner profile. Nothing is shared automatically — every connection is something you
              start, and you can revoke it at any time.
            </p>
          </div>

          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          <Card>
            <CardHeader>
              <CardTitle>Your Connections</CardTitle>
              <CardDescription>Accounts you&apos;ve linked from other apps in the ANDA network.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading connections...</p>
              ) : accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No connected accounts yet.</p>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{REMOTE_APP_LABELS[account.remote_app] || account.remote_app}</span>
                        <Badge
                          variant={account.status === "active" ? "secondary" : "outline"}
                          className="capitalize"
                        >
                          {account.status}
                        </Badge>
                      </div>
                      {account.remote_email && (
                        <p className="text-sm text-muted-foreground">{account.remote_email}</p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {account.scopes.map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs" title={describeScope(scope)}>
                            {scope}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Connected {new Date(account.created_at).toLocaleDateString()}
                        {account.revoked_at && ` · Revoked ${new Date(account.revoked_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    {account.status === "active" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(account.id)}
                        disabled={revokingId === account.id}
                      >
                        {revokingId === account.id ? "Revoking..." : "Revoke"}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connect to Neu Rafiki</CardTitle>
              <CardDescription>
                Link your account to import completed assessment results into an IEP learner profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {federationEnabled ? (
                <Button onClick={handleConnect} disabled={connecting} className="bg-[#3C9C87] hover:bg-[#2d7a6a]">
                  {connecting ? "Redirecting..." : "Connect to Neu Rafiki"}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Cross-app account linking is not enabled on this deployment.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
