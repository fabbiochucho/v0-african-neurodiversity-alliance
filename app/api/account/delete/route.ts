import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { deleteAccountData } from "@/lib/account-deletion"

// POST /api/account/delete { email } -- permanently deletes the caller's
// account. The typed email must match. Uses the service role, so every
// step is explicit and scoped to this user's id.
//
// Kept: payment records. subscriptions.user_id is set to null by the
// foreign key from scripts/043, so payment_transactions stay for
// financial record-keeping without pointing at a person.
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: "Please sign in again." }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  if (typeof body.email !== "string" || body.email.trim().toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json({ error: "The email you typed doesn't match your account." }, { status: 400 })
  }

  let service: ReturnType<typeof createServiceClient>
  try {
    service = createServiceClient()
  } catch {
    return NextResponse.json({ error: "Account deletion isn't available right now. Nothing was deleted." }, { status: 503 })
  }

  const uid = user.id
  try {
    await deleteAccountData(service, uid)
  } catch {
    console.error("account deletion failed part-way")
    return NextResponse.json(
      { error: "Something went wrong while deleting. Some data may already be removed; please try again or contact us." },
      { status: 500 },
    )
  }

  await supabase.auth.signOut().catch(() => {})
  return NextResponse.json({ ok: true })
}
