import Link from "next/link"
import { notFound } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServiceClient } from "@/lib/supabase/service"
import { getAdminEmail } from "@/lib/admin"
import { NewsletterComposer } from "./composer"

export const dynamic = "force-dynamic"
export const metadata = { title: "Newsletter | ANDA admin", robots: { index: false } }

export default async function AdminNewsletterPage() {
  if (!(await getAdminEmail())) notFound()

  const service = createServiceClient()
  const subscribers = () => service.from("newsletter_subscribers").select("id", { count: "exact", head: true })
  const [{ count: active }, { count: unsubscribed }, { data: issues }] = await Promise.all([
    subscribers().is("unsubscribed_at", null),
    subscribers().not("unsubscribed_at", "is", null),
    service
      .from("newsletter_issues")
      .select("id, subject, sent_by, recipients, failed, sent_at")
      .order("sent_at", { ascending: false })
      .limit(20),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 max-w-4xl">
        <header className="space-y-2">
          <Link href="/admin" className="text-sm text-primary underline">
            Admin dashboard
          </Link>
          <h1 className="text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground">
            Goes only to adults who ticked the newsletter box at sign-up (and confirmed their email) or turned it on in
            their account. Every email has a one-click unsubscribe link.
          </p>
        </header>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active subscribers</CardDescription>
              <CardTitle className="text-3xl">{active ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unsubscribed</CardDescription>
              <CardTitle className="text-3xl">{unsubscribed ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Consent records</CardDescription>
              <CardTitle className="text-base pt-2">
                <a href="/api/admin/newsletter/export" className="text-primary underline">
                  Download CSV
                </a>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Write an issue</CardTitle>
          </CardHeader>
          <CardContent>
            <NewsletterComposer activeCount={active ?? 0} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sent issues</CardTitle>
          </CardHeader>
          <CardContent>
            {!issues?.length ? (
              <p className="text-sm text-muted-foreground">Nothing sent yet.</p>
            ) : (
              <ul className="divide-y text-sm">
                {issues.map((i) => (
                  <li key={i.id} className="py-2 flex flex-wrap justify-between gap-2">
                    <span className="font-medium">{i.subject}</span>
                    <span className="text-muted-foreground">
                      {new Date(i.sent_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                      {i.recipients} sent{i.failed ? `, ${i.failed} failed` : ""} · {i.sent_by}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
