import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { AdminPage, fieldClass } from "@/components/admin/admin-page"
import { ContentBody } from "@/components/content-body"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createServiceClient } from "@/lib/supabase/service"
import { allowed, requireStaff, staffForAction } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"
import { CONTENT_KINDS, isContentKind, slugify, type ContentItem } from "@/lib/content"

export const dynamic = "force-dynamic"
export const metadata = { title: "Edit post | ANDA admin", robots: { index: false } }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }
const MAX_IMAGE = 5 * 1024 * 1024

const done = (id: string, msg: string): never => redirect(`/admin/content/${id}?msg=${encodeURIComponent(msg)}`)
const refreshPublic = (slug: string) => {
  revalidatePath("/blog")
  revalidatePath(`/blog/${slug}`)
  revalidatePath("/news")
}

async function save(formData: FormData) {
  "use server"
  const staff = await staffForAction("content.edit")
  const id = String(formData.get("id") ?? "")
  if (!staff || !UUID.test(id)) return
  const db = createServiceClient()
  const { data: before } = await db.from("content_items").select("*").eq("id", id).maybeSingle<ContentItem>()
  if (!before) return
  const kind = String(formData.get("kind") ?? before.kind)
  const slug = slugify(String(formData.get("slug") ?? "")) || before.slug
  const external = String(formData.get("external_url") ?? "").trim()
  const patch: Record<string, unknown> = {
    kind: isContentKind(kind) ? kind : before.kind,
    title: String(formData.get("title") ?? "").trim().slice(0, 200) || before.title,
    slug,
    summary: String(formData.get("summary") ?? "").trim().slice(0, 500),
    body: String(formData.get("body") ?? "").slice(0, 100_000),
    external_url: external.startsWith("https://") ? external : null,
    updated_by: staff.email,
    updated_at: new Date().toISOString(),
  }

  const file = formData.get("cover")
  if (file instanceof File && file.size > 0) {
    const ext = IMAGE_TYPES[file.type]
    if (!ext || file.size > MAX_IMAGE) done(id, "Cover images must be JPEG, PNG or WebP, up to 5 MB.")
    const path = `${id}/${Date.now()}.${ext}`
    const { error: upErr } = await db.storage.from("content").upload(path, file, { contentType: file.type })
    if (upErr) done(id, `Image upload failed: ${upErr.message}`)
    patch.cover_image_url = db.storage.from("content").getPublicUrl(path).data.publicUrl
  } else if (formData.get("remove_cover") === "on") patch.cover_image_url = null

  const { error } = await db.from("content_items").update(patch).eq("id", id)
  if (error) done(id, error.message.includes("slug") ? "That web address is taken or invalid." : error.message)
  await logAdminAction(staff, "content.update", {
    type: "content",
    id,
    before: { title: before.title, slug: before.slug, kind: before.kind, summary: before.summary },
    after: { title: patch.title, slug, kind: patch.kind, summary: patch.summary, body_changed: patch.body !== before.body },
  })
  if (before.status === "published") refreshPublic(slug)
  done(id, "Saved.")
}

async function setStatus(formData: FormData) {
  "use server"
  const status = String(formData.get("status") ?? "")
  const staff = await staffForAction(status === "draft" ? "content.edit" : "content.publish")
  const id = String(formData.get("id") ?? "")
  if (!staff || !UUID.test(id) || !["draft", "published", "archived"].includes(status)) return
  const db = createServiceClient()
  const { data: before } = await db.from("content_items").select("status, published_at, slug, body, title").eq("id", id).maybeSingle()
  if (!before) return
  if (status === "published" && !before.body.trim()) done(id, "Write something before publishing.")
  const patch = {
    status,
    published_at: status === "published" ? (before.published_at ?? new Date().toISOString()) : before.published_at,
    updated_by: staff.email,
    updated_at: new Date().toISOString(),
  }
  const { error } = await db.from("content_items").update(patch).eq("id", id)
  if (error) done(id, error.message)
  await logAdminAction(staff, `content.${status === "published" ? "publish" : status === "archived" ? "archive" : "unpublish"}`, {
    type: "content",
    id,
    before: { status: before.status },
    after: { status, published_at: patch.published_at },
  })
  refreshPublic(before.slug)
  done(id, status === "published" ? "Published." : status === "archived" ? "Archived." : "Moved back to draft.")
}

export default async function EditContentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const staff = await requireStaff("content.edit")
  const { id } = await params
  const { msg } = await searchParams
  if (!UUID.test(id)) notFound()
  const { data: item } = await createServiceClient().from("content_items").select("*").eq("id", id).maybeSingle<ContentItem>()
  if (!item) notFound()
  const can = allowed(staff, ["content.publish"])
  const statusButton = (status: string, label: string, variant: "default" | "outline" | "destructive" = "outline") => (
    <form action={setStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={variant}>{label}</Button>
    </form>
  )

  return (
    <AdminPage
      title={item.title}
      back={{ href: "/admin/content", label: "All content" }}
      message={msg}
      intro={
        <p className="flex flex-wrap gap-3">
          <span>{CONTENT_KINDS[item.kind]} · {item.status}{item.published_at ? ` since ${item.published_at.slice(0, 10)}` : ""}</span>
          {item.status === "published" && <Link href={`/blog/${item.slug}`} className="text-primary underline">View on the site</Link>}
        </p>
      }
    >
      <div className="flex flex-wrap gap-2">
        {can.has("content.publish") && item.status !== "published" && statusButton("published", "Publish", "default")}
        {item.status === "published" && statusButton("draft", "Unpublish")}
        {can.has("content.publish") && item.status !== "archived" && statusButton("archived", "Archive", "destructive")}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Edit</CardTitle></CardHeader>
          <CardContent>
            <form action={save} className="space-y-3 text-sm">
              <input type="hidden" name="id" value={id} />
              <label htmlFor="e-kind" className="block">Type</label>
              <select id="e-kind" name="kind" defaultValue={item.kind} className={fieldClass}>
                {Object.entries(CONTENT_KINDS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <label htmlFor="e-title" className="block">Title</label>
              <Input id="e-title" name="title" defaultValue={item.title} maxLength={200} required />
              <label htmlFor="e-slug" className="block">Web address: /blog/…</label>
              <Input id="e-slug" name="slug" defaultValue={item.slug} maxLength={100} />
              <label htmlFor="e-summary" className="block">Summary (shown in lists and the digest)</label>
              <Textarea id="e-summary" name="summary" defaultValue={item.summary} maxLength={500} rows={2} />
              <label htmlFor="e-body" className="block">Text</label>
              <Textarea id="e-body" name="body" defaultValue={item.body} rows={16} aria-describedby="e-body-help" />
              <p id="e-body-help" className="text-xs text-muted-foreground">
                Blank line between paragraphs, &quot;## &quot; for a heading, &quot;- &quot; for a list item. https:// links become clickable.
              </p>
              <label htmlFor="e-ext" className="block">Link to an outside page instead (optional, https://)</label>
              <Input id="e-ext" name="external_url" defaultValue={item.external_url ?? ""} />
              <label htmlFor="e-cover" className="block">Cover image (JPEG, PNG or WebP, up to 5 MB)</label>
              <input id="e-cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="block text-sm" />
              {item.cover_image_url && (
                <label htmlFor="e-rm" className="flex items-center gap-2">
                  <input id="e-rm" type="checkbox" name="remove_cover" className="h-4 w-4" /> Remove the current cover
                </label>
              )}
              <Button type="submit">Save</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Preview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {item.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element -- images are unoptimised site-wide
              <img src={item.cover_image_url} alt="" className="w-full rounded-lg" />
            )}
            <h2 className="text-2xl font-bold">{item.title}</h2>
            {item.summary && <p className="text-muted-foreground">{item.summary}</p>}
            <ContentBody body={item.body} />
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  )
}
