import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveLink } from "@/lib/federation/remote"
import { isFederationEnabled } from "@/lib/federation/config"
import { ImportChooser } from "./import-chooser"

// "Continue to ANDA" handoff from NeuRafiki (brief §14, §47):
// /welcome/from-neurafiki?assessment=<assessment id>
export default async function FromNeuRafikiPage(props: { searchParams: Promise<{ assessment?: string }> }) {
  const searchParams = await props.searchParams;
  const assessment = typeof searchParams.assessment === "string" ? searchParams.assessment.slice(0, 100) : ""
  const back = `/welcome/from-neurafiki${assessment ? `?assessment=${encodeURIComponent(assessment)}` : ""}`

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let body: React.ReactNode
  if (!user) {
    body = (
      <>
        <p>
          ANDA turns your NeuRafiki assessment into practical support: a support profile, goals and progress you can share
          with the people who help. Your NeuRafiki and ANDA plans stay separate.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/auth/sign-up?redirectTo=${encodeURIComponent(back)}`}>Create an ANDA account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/auth/login?redirectTo=${encodeURIComponent(back)}`}>Sign in</Link>
          </Button>
        </div>
      </>
    )
  } else if (!isFederationEnabled()) {
    body = <p>Linking with NeuRafiki isn&apos;t switched on for this site yet. You can still create a support profile yourself.</p>
  } else if (!(await getActiveLink(supabase, user.id))) {
    body = (
      <>
        <p>To bring your assessment summary across, first connect your NeuRafiki account. You choose what&apos;s shared.</p>
        <Button asChild>
          <Link href="/settings/connections">Connect NeuRafiki</Link>
        </Button>
      </>
    )
  } else {
    const { data: learners } = await supabase.from("learner_profiles").select("id, name").eq("user_id", user.id).order("name")
    body = <ImportChooser assessmentId={assessment || null} learners={learners ?? []} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome from NeuRafiki</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {body}
            <p className="text-xs text-muted-foreground">
              Only a summary of your assessment results comes across (areas and levels as NeuRafiki reported them), never your
              individual answers. It&apos;s labelled as a NeuRafiki assessment in ANDA, not a diagnosis.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
