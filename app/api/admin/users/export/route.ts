import { NextResponse } from "next/server"
import { staffForApi } from "@/lib/admin"
import { can } from "@/lib/admin/permissions"
import { logAdminAction } from "@/lib/admin/audit"
import { toCsv } from "@/lib/admin/pii"
import { searchArgs, type UserParams, type UserRow } from "@/lib/admin/users"
import { createServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

// ponytail: builds the CSV in one request, up to MAX rows. Move to a background job with an
// emailed link if exports ever need more than that.
const MAX = 20_000

// CSV of the accounts matching the /admin/users filters. Contains emails, so it needs both
// exports.run and users.reveal_pii, and is logged.
export async function GET(request: Request) {
  const staff = await staffForApi("exports.run")
  if (staff instanceof NextResponse) return staff
  if (!can(staff.role, "users.reveal_pii")) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const p = Object.fromEntries(new URL(request.url).searchParams) as UserParams
  const rows: UserRow[] = []
  for (let page = 0; rows.length < MAX; page++) {
    const { data, error } = await createServiceClient().rpc("admin_user_search", searchArgs(p, page, 200))
    if (error) return NextResponse.json({ error: "Couldn't load users." }, { status: 500 })
    rows.push(...((data ?? []) as UserRow[]))
    if (!data || data.length < 200) break
  }
  await logAdminAction(staff, "users.export", { type: "user_list", after: { filters: p, rows: rows.length } })
  const cols = ["user_id", "email", "first_name", "last_name", "plan", "signed_up_at", "last_sign_in_at", "email_confirmed_at", "suspended_at", "deleted_at", "tags"]
  return new NextResponse(toCsv(cols, rows as unknown as Record<string, unknown>[]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="anda-users-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
