import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { NextResponse } from "next/server"

// GET /api/iep - list all IEPs (with learner + goals) created by the current user
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("ieps")
      .select("*, learner_profiles(*), iep_goals(*)")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return dbErrorResponse(error)
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
