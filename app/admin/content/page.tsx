import Link from "next/link"
import { redirect } from "next/navigation"
import { AdminPage, fieldClass } from "@/components/admin/admin-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createServiceClient } from "@/lib/supabase/service"
import { requireStaff, staffForAction } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"
import { CONTENT_KINDS, isContentKind, slugify } from "@/lib/content"

export const dynamic = "force-dynamic"
export const metadata = { title: "Content | ANDA admin", robots: { index: false } }

async function create(formData: FormData) {
  "use server"
  const staff = await staffForAction("content.edit")
  if (!staff) return
  const kind = String(formData.get("kind") ?? "")
  const title = String(formData.get("title") ?? "").trim().slice(0, 200)
  if (!isContentKind(kind) || !title) redirect("/admin/content?msg=Give%20it%20a%20title.")
  const db = createServiceClient()
  let slug = slugify(title) || "post"
  const { data: taken } = await db.from("content_items").select("id").eq("slug", slug).maybeSingle()
  if (taken) slug = `${slug}-${Date.now().toString(36)}`
  const { data, error } = await db
    .from("content_items")
    .insert({ kind, title, slug, author_email: staff.email, updated_by: staff.email })
    .select("id")
    .single()
  if (error) redirect(`/admin/content?msg=${encodeURIComponent(error.message)}`)
  await logAdminAction(staff, "content.create", { type: "content", id: data.id, after: { kind, title, slug } })
  redirect(`/admin/content/${data.id}`)
}

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ kind?: string; msg?: string }> }) {
  await requireStaff("content.edit")
  const p = await searchParams
  let q = createServiceClient()
    .from("content_items")
    .select("id, kind, title, slug, status, published_at, updated_at, author_email")
    .order("updated_at", { ascending: false })
    .limit(200)
  if (isContentKind(p.kind)) q = q.eq("kind", p.kind)
  const { data: items, error } = await q

  return (
    <AdminPage
      title="Blog, news and training"
      message={p.msg}
      intro={
        <p>
          Write posts here; published ones appear on <Link href="/blog" className="underline">/blog</Link>, and news also on the
          News page. Drafts are visible only to staff.
        </p>
      }
    >
      <Card>
        <CardHeader><CardTitle className="text-lg">New post</CardTitle></CardHeader>
        <CardContent>
          <form action={create} className="flex flex-wrap gap-2 items-end">
            <label htmlFor="c-kind" className="text-sm space-y-1"><span className="block">Type</span>
              <select id="c-kind" name="kind" className={fieldClass} defaultValue="blog">
                {Object.entries(CONTENT_KINDS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label htmlFor="c-title" className="text-sm space-y-1"><span className="block">Title</span>
              <Input id="c-title" name="title" required maxLength={200} className="w-80" />
            </label>
            <Button type="submit">Create draft</Button>
          </form>
        </CardContent>
      </Card>

      <nav aria-label="Filter by type" className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/content" className={`rounded-md px-3 py-1.5 ${!p.kind ? "bg-primary text-primary-foreground" : "border"}`}>All</Link>
        {Object.entries(CONTENT_KINDS).map(([v, l]) => (
          <Link key={v} href={`/admin/content?kind=${v}`} className={`rounded-md px-3 py-1.5 ${p.kind === v ? "bg-primary text-primary-foreground" : "border"}`}>{l}</Link>
        ))}
      </nav>

      {error ? (
        <p role="alert" className="text-destructive">Couldn&apos;t load content. Has migration 060 been applied?</p>
      ) : !items?.length ? (
        <p className="text-muted-foreground">Nothing written yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border text-sm">
          {items.map((i) => (
            <li key={i.id} className="p-3 flex flex-wrap justify-between gap-2">
              <Link href={`/admin/content/${i.id}`} className="font-medium text-primary underline">{i.title}</Link>
              <span className="text-muted-foreground">
                {CONTENT_KINDS[i.kind as keyof typeof CONTENT_KINDS]} · {i.status}
                {i.published_at ? ` ${i.published_at.slice(0, 10)}` : ""} · {i.author_email}
              </span>
            </li>
          ))}
        </ul>
      )}
    </AdminPage>
  )
}
