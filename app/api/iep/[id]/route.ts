import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse } from "@/lib/api-error"
import { NextResponse } from "next/server"

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("ieps")
      .select("*, learner_profiles(*), iep_goals(*)")
      .eq("id", params.id)
      .single()

    if (error) {
      return dbErrorResponse(error)
    }

    if (data.created_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Something didn't save. Your information is still here. Try again." }, { status: 500 })
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
    }

    const updateData = await request.json()

    const { data, error } = await supabase
      .from("ieps")
      .update(updateData)
      .eq("id", params.id)
      .eq("created_by", user.id)
      .select()
      .single()

    if (error) {
      return dbErrorResponse(error)
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Something didn't save. Your information is still here. Try again." }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
    }

    const { error } = await supabase.from("ieps").delete().eq("id", params.id).eq("created_by", user.id)

    if (error) {
      return dbErrorResponse(error)
    }

    return NextResponse.json({ message: "IEP deleted successfully" })
  } catch (err) {
    return NextResponse.json({ error: "Something didn't save. Your information is still here. Try again." }, { status: 500 })
  }
}
