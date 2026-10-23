import Link from "next/link"
import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createServiceClient } from "@/lib/supabase/service"
import { getAdminEmail } from "@/lib/admin"

export const dynamic = "force-dynamic"
export const metadata = { title: "Directory suggestions | ANDA", robots: { index: false } }

interface Submission {
  id: string
  name: string
  category: string
  description: string | null
  country: string | null
  region: string | null
  city: string | null
  address: string | null
  age_min: number | null
  age_max: number | null
  services: string[]
  curriculum: string[]
  class_size_avg: number | null
  provider_type: string | null
  conditions: string[] | null
  contact_info: { phone?: string; email?: string; website?: string } | null
  submitted_by_email: string | null
  submitter_role: string | null
  created_at: string
}

// Publish a suggestion as a directory listing. "verified" is only set when
// the reviewer has checked the details on the organisation's own website or
// by contacting it; otherwise the listing shows as unverified.
async function publish(formData: FormData) {
  "use server"
  const reviewer = await getAdminEmail()
  if (!reviewer) return
  const id = String(formData.get("id") ?? "")
  const verified = formData.get("verified") === "on"
  const db = createServiceClient()
  const { data: s } = await db.from("resource_submissions").select("*").eq("id", id).eq("status", "pending").maybeSingle()
  if (!s) return
  const website = s.contact_info?.website as string | undefined
  const { data: resource, error } = await db
    .from("resources")
    .insert({
      name: s.name,
      category: s.category,
      description: s.description,
      country: s.country,
      region: s.region,
      city: s.city ?? s.location,
      address: s.address,
      location: [s.city ?? s.location, s.region].filter(Boolean).join(", ") || s.country,
      age_min: s.age_min,
      age_max: s.age_max,
      services: s.services ?? [],
      curriculum: s.curriculum ?? [],
      class_size_avg: s.class_size_avg,
      provider_type: s.provider_type,
      conditions: s.conditions ?? [],
      contact_info: s.contact_info ?? {},
      url: website ?? null,
      source_url: website ?? null,
      verified,
      last_verified_at: verified ? new Date().toISOString().slice(0, 10) : null,
      is_published: true,
    })
    .select("id")
    .single()
  if (error) {
    console.error("Publishing suggestion failed:", error)
    return
  }
  await db
    .from("resource_submissions")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: reviewer, resource_id: resource.id })
    .eq("id", id)
  revalidatePath("/admin/submissions")
}

async function reject(formData: FormData) {
  "use server"
  const reviewer = await getAdminEmail()
  if (!reviewer) return
  await createServiceClient()
    .from("resource_submissions")
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: reviewer })
    .eq("id", String(formData.get("id") ?? ""))
    .eq("status", "pending")
  revalidatePath("/admin/submissions")
}

const row = (label: string, value: React.ReactNode) =>
  value ? (
    <div className="grid grid-cols-[9rem_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words">{value}</dd>
    </div>
  ) : null

export default async function SubmissionsPage() {
  if (!(await getAdminEmail())) notFound()
  const { data } = await createServiceClient()
    .from("resource_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(100)
  const pending = (data ?? []) as Submission[]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 max-w-4xl">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Directory suggestions</h1>
          <p className="text-muted-foreground">
            {pending.length} waiting. Check each organisation (its website, or a call) before publishing. Tick
            &quot;Verified&quot; only if you confirmed the details yourself; otherwise it is listed as unverified.
          </p>
          <p>
            <Link href="/admin" className="text-primary underline">
              Admin dashboard
            </Link>
          </p>
        </header>

        {pending.length === 0 ? (
          <p className="text-muted-foreground">Nothing waiting for review.</p>
        ) : (
          <ul className="space-y-6">
            {pending.map((s) => (
              <li key={s.id} className="rounded-lg border p-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{s.name}</h2>
                  <Badge variant="outline">{s.category}</Badge>
                  {s.submitter_role && <Badge variant="secondary">from: {s.submitter_role}</Badge>}
                </div>
                <dl className="space-y-1 text-sm">
                  {row("Where", [s.address, s.city, s.region, s.country].filter(Boolean).join(", "))}
                  {row("Ages", s.age_min != null || s.age_max != null ? `${s.age_min ?? "?"}–${s.age_max ?? "?"}` : null)}
                  {row("Services", s.services?.join(", "))}
                  {row("Conditions", s.conditions?.join(", "))}
                  {row("Curriculum", s.curriculum?.join(", "))}
                  {row("Class size", s.class_size_avg)}
                  {row("Provider type", s.provider_type)}
                  {row("Phone", s.contact_info?.phone)}
                  {row("Email", s.contact_info?.email)}
                  {row(
                    "Website",
                    s.contact_info?.website && (
                      <a href={s.contact_info.website} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        {s.contact_info.website}
                      </a>
                    ),
                  )}
                  {row("Description", s.description)}
                  {row("Suggested by", s.submitted_by_email)}
                  {row("Received", new Date(s.created_at).toLocaleDateString("en-GB"))}
                </dl>
                <div className="flex flex-wrap items-center gap-3">
                  <form action={publish} className="flex items-center gap-3">
                    <input type="hidden" name="id" value={s.id} />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="verified" className="h-4 w-4" /> Verified
                    </label>
                    <Button type="submit" size="sm">
                      Publish
                    </Button>
                  </form>
                  <form action={reject}>
                    <input type="hidden" name="id" value={s.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Reject
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
