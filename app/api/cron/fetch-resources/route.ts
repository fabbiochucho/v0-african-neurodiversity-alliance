import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { isCronRequest } from "@/lib/cron-auth"
import { fetchApps, fetchBooks } from "@/lib/discover"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Weekly (vercel.json). ?job=books or ?job=apps runs one half. Existing rows
// are left alone (ignoreDuplicates) so an admin's "hide" is never undone.
export async function GET(request: Request) {
  if (!isCronRequest(request)) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 })
  }
  const job = new URL(request.url).searchParams.get("job")
  const [books, apps] = await Promise.all([job === "apps" ? [] : fetchBooks(), job === "books" ? [] : fetchApps()])
  const items = [...books, ...apps]

  if (items.length) {
    const { error } = await createServiceClient()
      .from("discovered_resources")
      .upsert(items, { onConflict: "url", ignoreDuplicates: true })
    if (error) {
      console.error("Resource upsert failed:", error)
      return NextResponse.json({ error: "Failed to save resources" }, { status: 500 })
    }
  }
  return NextResponse.json({ books: books.length, apps: apps.length })
}
