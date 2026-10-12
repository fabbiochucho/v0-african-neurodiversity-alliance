import { createClient } from "@/lib/supabase/server"
import { dbErrorResponse, upgradeRequiredResponse } from "@/lib/api-error"
import { getEntitlement, nextTier } from "@/lib/entitlements"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, age, gender, country, diagnosis_domains } = await request.json()

    const entitlement = await getEntitlement(supabase, user.id)
    const { count, error: countError } = await supabase
      .from("learner_profiles")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)

    if (countError) {
      return dbErrorResponse(countError)
    }

    if ((count ?? 0) >= entitlement.learnerLimit) {
      return upgradeRequiredResponse(
        `Your plan allows ${entitlement.learnerLimit} learner profile${entitlement.learnerLimit === 1 ? "" : "s"}. Upgrade to add more.`,
        nextTier(entitlement.tier),
      )
    }

    const { data, error } = await supabase
      .from("learner_profiles")
      .insert({
        user_id: user.id,
        name,
        age,
        gender,
        country,
        diagnosis_domains: diagnosis_domains || [],
      })
      .select()
      .single()

    if (error) {
      return dbErrorResponse(error)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
      .from("learner_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return dbErrorResponse(error)
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
