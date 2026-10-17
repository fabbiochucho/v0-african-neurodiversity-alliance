import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { describePermissions, roleLabel } from "@/lib/support-team"
import { AcceptInviteButton } from "./accept-invite-button"

// Landing page for emailed invite links. Accepting is a deliberate POST
// (button), never a side effect of opening the link, so email link
// scanners can't accept on someone's behalf.
export default async function AcceptInvitePage(props: { searchParams: Promise<{ invite?: string; token?: string }> }) {
  const searchParams = await props.searchParams;
  const { invite, token } = searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const back = `/team/accept?invite=${encodeURIComponent(invite ?? "")}&token=${encodeURIComponent(token ?? "")}`
    redirect(`/auth/login?redirectTo=${encodeURIComponent(back)}`)
  }

  // RLS shows the invitee only invites addressed to their own email.
  const { data: row } = invite
    ? await supabase
        .from("support_team_members")
        .select("id, learner_name, role, permissions, status, invite_expires_at")
        .eq("id", invite)
        .maybeSingle()
    : { data: null }

  const expired = row?.invite_expires_at ? new Date(row.invite_expires_at) <= new Date() : false

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Support team invitation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {!row || !token ? (
              <p>
                We couldn&apos;t find this invitation for <strong>{user.email}</strong>. Make sure you&apos;re signed in
                with the email address it was sent to, or ask for a new invite.
              </p>
            ) : row.status === "active" ? (
              <p>You&apos;ve already accepted this invitation. Find {row.learner_name} on your dashboard.</p>
            ) : expired ? (
              <p>This invitation has expired. Ask the person who invited you to send it again.</p>
            ) : (
              <>
                <p>
                  Join <strong>{row.learner_name}</strong>&apos;s support team as a{" "}
                  {roleLabel(row.role)}.{" "}
                  {describePermissions(row.permissions)}
                </p>
                <AcceptInviteButton inviteId={row.id} token={token} />
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
