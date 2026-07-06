import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/lib/icons"
import type { IEP, IEPGoal, LearnerProfile } from "@/lib/types/iep"

type IEPWithRelations = IEP & {
  learner_profiles: LearnerProfile | null
  iep_goals: IEPGoal[]
}

export default async function IEPDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: ieps } = await supabase
    .from("ieps")
    .select("*, learner_profiles(*), iep_goals(*)")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  const typedIeps = (ieps || []) as IEPWithRelations[]

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#3C9C87]/10 text-[#3C9C87]"
      case "archived":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-[#FFC857]/10 text-[#a97b00]"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-4xl font-bold text-balance mb-2">IEP Dashboard</h1>
              <p className="text-muted-foreground">Manage every Individualized Education Plan you've created.</p>
            </div>
            <Button asChild className="bg-[#3C9C87] hover:bg-[#2d7a6a]">
              <Link href="/iep/generate">
                <Icons.Plus className="h-4 w-4 mr-2" />
                Create New IEP
              </Link>
            </Button>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <Link href="/iep/progress" className="p-4 border rounded-lg hover:border-[#3C9C87] transition text-center">
              <Icons.TrendingUp className="h-5 w-5 mx-auto mb-2 text-[#3C9C87]" />
              <span className="text-sm font-medium">Progress</span>
            </Link>
            <Link href="/iep/reports" className="p-4 border rounded-lg hover:border-[#0081A7] transition text-center">
              <Icons.FileText className="h-5 w-5 mx-auto mb-2 text-[#0081A7]" />
              <span className="text-sm font-medium">Reports</span>
            </Link>
            <Link
              href="/iep/settings/subscription"
              className="p-4 border rounded-lg hover:border-[#FFC857] transition text-center"
            >
              <Icons.Users className="h-5 w-5 mx-auto mb-2 text-[#FFC857]" />
              <span className="text-sm font-medium">Subscription</span>
            </Link>
            <Link href="/iep/generate" className="p-4 border rounded-lg hover:border-[#3C9C87] transition text-center">
              <Icons.Plus className="h-5 w-5 mx-auto mb-2 text-[#3C9C87]" />
              <span className="text-sm font-medium">New IEP</span>
            </Link>
          </div>

          {typedIeps.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Icons.FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No IEPs yet</h3>
                <p className="text-muted-foreground mb-6">
                  Generate your first Individualized Education Plan to start tracking goals and progress.
                </p>
                <Button asChild className="bg-[#3C9C87] hover:bg-[#2d7a6a]">
                  <Link href="/iep/generate">Create New IEP</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {typedIeps.map((iep) => (
                <Card key={iep.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">{iep.title || "Untitled IEP"}</CardTitle>
                        <CardDescription>{iep.learner_profiles?.name || "Unknown learner"}</CardDescription>
                      </div>
                      <Badge className={statusColor(iep.status)}>{iep.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {iep.ai_summary && <p className="text-sm text-muted-foreground line-clamp-3">{iep.ai_summary}</p>}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{iep.iep_goals?.length || 0} goals</span>
                      <span>Created {new Date(iep.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(iep.learner_profiles?.diagnosis_domains || []).map((domain) => (
                        <Badge key={domain} variant="outline" className="text-xs">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Link href="/iep/progress">Track Progress</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Link href="/iep/reports">Reports</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
