import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { NextResponse } from "next/server"
import { logAudit, learnerIdForGoal } from "@/lib/audit"

export async function PUT(request: Request, { params }: { params: { goalId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
    }

    const body = await request.json()

    // Only goal content/status are user-editable; iep_id etc. are not.
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of [
      "goal_text",
      "domain",
      "status",
      "target_completion_date",
      "baseline",
      "target",
      "measurement",
      "frequency",
      "responsible_person",
      "support_strategy",
      "review_date",
      "evidence",
    ]) {
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

    await logAudit({ actorId: user.id, action: "change", resource: `goal updated (${Object.keys(updateData).filter((k) => k !== "updated_at").join(", ")})`, learnerId: await learnerIdForGoal(params.goalId) })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Something didn't save. Your information is still here. Try again." }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { goalId: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
    }

    const { error } = await supabase.from("iep_goals").delete().eq("id", params.goalId)

    if (error) {
      return dbErrorResponse(error)
    }

    return NextResponse.json({ message: "Goal deleted successfully" })
  } catch (err) {
    return NextResponse.json({ error: "Something didn't save. Your information is still here. Try again." }, { status: 500 })
  }
}
