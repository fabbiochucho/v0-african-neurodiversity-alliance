import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Revokes a linked_accounts row. We update status rather than deleting so
// there's an audit trail of past connections; RLS (linked_accounts_update_own)
// ensures a user can only revoke their own rows regardless of what id is
// passed in.
export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("linked_accounts")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("id", params.id)
      .eq("local_user_id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
