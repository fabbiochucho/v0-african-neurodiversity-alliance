import Link from "next/link"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createServiceClient } from "@/lib/supabase/service"
import { ownerEmails, requireStaff, staffForAction } from "@/lib/admin"
import { logAdminAction } from "@/lib/admin/audit"
import { ROLE_LABELS, ROLE_PERMISSIONS, STAFF_ROLES, isStaffRole } from "@/lib/admin/permissions"

export const dynamic = "force-dynamic"
export const metadata = { title: "Staff | ANDA admin", robots: { index: false } }

const field = "rounded-md border border-input bg-background px-3 py-2 text-sm"

async function addStaff(formData: FormData) {
  "use server"
  const staff = await staffForAction("staff.manage")
  if (!staff) return
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const role = formData.get("role")
  if (!email || !isStaffRole(role)) return
  const db = createServiceClient()
  // Staff must already have an ANDA account (they set their own password and 2FA).
  const { data: profile } = await db.from("profiles").select("id, email").eq("email", email).maybeSingle()
  if (!profile) redirect("/admin/staff?msg=no-account")
  const { data: before } = await db.from("staff_members").select("role").eq("user_id", profile.id).maybeSingle()
  const { error } = await db
    .from("staff_members")
    .upsert({ user_id: profile.id, email, role, added_by: staff.email, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
  if (error) {
    console.error("Adding staff failed:", error)
    redirect("/admin/staff?msg=failed")
  }
  await logAdminAction(staff, before ? "staff.role_change" : "staff.add", {
    type: "staff",
    id: profile.id,
    before: before ?? null,
    after: { email, role },
  })
  revalidatePath("/admin/staff")
  redirect("/admin/staff?msg=saved")
}

async function removeStaff(formData: FormData) {
  "use server"
  const staff = await staffForAction("staff.manage")
  if (!staff) return
  const userId = String(formData.get("user_id") ?? "")
  if (!userId || userId === staff.userId) return // can't remove yourself
  const db = createServiceClient()
  const { data: before } = await db.from("staff_members").select("email, role").eq("user_id", userId).maybeSingle()
  if (!before) return
  const { error } = await db.from("staff_members").delete().eq("user_id", userId)
  if (error) return console.error("Removing staff failed:", error)
  await logAdminAction(staff, "staff.remove", { type: "staff", id: userId, before, after: null })
  revalidatePath("/admin/staff")
}

const MESSAGES: Record<string, string> = {
  saved: "Saved.",
  "no-account": "No ANDA account uses that email. Ask them to sign up first, then add them.",
  failed: "That didn't save. Try again.",
}

export default async function StaffPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const me = await requireStaff("staff.manage")
  const { msg } = await searchParams
  const { data: rows } = await createServiceClient()
    .from("staff_members")
    .select("user_id, email, role, added_by, updated_at")
    .order("email")
  const owners = ownerEmails()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 max-w-4xl">
        <header className="space-y-2">
          <Link href="/admin" className="text-sm text-primary underline">
            Admin dashboard
          </Link>
          <h1 className="text-3xl font-bold">Staff and roles</h1>
          <p className="text-muted-foreground">
            Staff sign in with their own ANDA account and must set up 2FA before the panel opens. Every change here is
            recorded in the audit log.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Add someone or change their role</CardTitle>
            <CardDescription>They need an ANDA account first, with this email.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addStaff} className="flex flex-wrap gap-2 items-end">
              <label className="space-y-1 text-sm" htmlFor="f-email">
                <span className="block">Email</span>
                <Input name="email" id="f-email" type="email" required className="w-64" />
              </label>
              <label className="space-y-1 text-sm" htmlFor="f-role">
                <span className="block">Role</span>
                <select name="role" id="f-role" className={field} defaultValue="read_only">
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit">Save</Button>
            </form>
            <p role="status" className="mt-2 text-sm">
              {msg ? MESSAGES[msg] : null}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {owners.map((email) => (
                <li key={email} className="py-2 flex flex-wrap justify-between gap-2">
                  <span>{email}</span>
                  <span className="text-muted-foreground">Super admin (owner, set in ADMIN_EMAILS)</span>
                </li>
              ))}
              {(rows ?? [])
                .filter((r) => !owners.includes(r.email))
                .map((r) => (
                  <li key={r.user_id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                    <span>{r.email}</span>
                    <span className="flex items-center gap-3 text-muted-foreground">
                      {isStaffRole(r.role) ? ROLE_LABELS[r.role] : r.role} · added by {r.added_by}
                      {r.user_id !== me.userId && (
                        <form action={removeStaff}>
                          <input type="hidden" name="user_id" value={r.user_id} />
                          <Button type="submit" size="sm" variant="outline">
                            Remove
                          </Button>
                        </form>
                      )}
                    </span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What each role can do</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {STAFF_ROLES.map((r) => (
                <div key={r}>
                  <dt className="font-medium">{ROLE_LABELS[r]}</dt>
                  <dd className="text-muted-foreground break-words">{ROLE_PERMISSIONS[r].join(", ")}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
