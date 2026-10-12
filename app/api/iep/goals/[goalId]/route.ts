import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { goalId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Only goal content/status are user-editable; iep_id etc. are not.
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of ["goal_text", "domain", "status", "target_completion_date", "baseline", "target", "measurement"]) {
      if (key in body) updateData[key] = body[key]
    }
    if ("status" in body && !["in_progress", "achieved", "revised"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("iep_goals")
      .update(updateData)
      .eq("id", params.goalId)
      .select()
      .single()

    if (error) {
      return dbErrorResponse(error)
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { goalId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("iep_goals").delete().eq("id", params.goalId)

    if (error) {
      return dbErrorResponse(error)
    }

    return NextResponse.json({ message: "Goal deleted successfully" })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
