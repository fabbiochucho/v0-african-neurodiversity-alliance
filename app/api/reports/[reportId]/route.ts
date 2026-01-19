import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { reportId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("reports").select("*").eq("id", params.reportId).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Check if user has access to this report
    const { data: learner } = await supabase
      .from("learner_profiles")
      .select("user_id")
      .eq("id", data.learner_id)
      .single()

    if (learner.user_id !== user.id && data.generated_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
