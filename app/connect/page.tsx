import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { verifySiblingLinkToken } from "@/lib/federation/jwt"
import { describeScope } from "@/lib/federation/config"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectActions } from "./connect-actions"

function ConnectErrorCard({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Can&apos;t connect account</CardTitle>
              <CardDescription>{message}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Receives a /connect?token=... redirect from Neu Rafiki when a user there
// clicks "Connect to Alliance". Verifies the token was really signed by Neu
// Rafiki, then shows a consent screen before creating the linked_accounts row.
export default async function ConnectPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token

  if (!token) {
    return <ConnectErrorCard message="Missing connection token. Start the connection from Neu Rafiki's account settings." />
  }

  let payload
  try {
    payload = await verifySiblingLinkToken(token)
  } catch {
    return (
      <ConnectErrorCard message="This connection link is invalid or has expired. Please try connecting again from Neu Rafiki." />
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=${encodeURIComponent(`/connect?token=${token}`)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Connect your Neu Rafiki account</CardTitle>
              <CardDescription>
                Connect your Neu Rafiki account ({payload.email}) to your Alliance account?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-2">This will allow:</p>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  {payload.scopes.map((scope) => (
                    <li key={scope}>{describeScope(scope)}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                You can revoke this connection at any time from Settings &gt; Connections.
              </p>
              <ConnectActions token={token} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
