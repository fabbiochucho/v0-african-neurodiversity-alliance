import { NextResponse } from "next/server"

// Supabase/Postgres error.message can include table/column/constraint names
// (e.g. "duplicate key value violates unique constraint \"ieps_pkey\""),
// which is fine to log server-side but shouldn't reach the client. Route
// handlers should log the real error and respond with this instead of
// forwarding error.message directly.
export function dbErrorResponse(error: { message: string }, status = 400) {
  console.error(error)
  return NextResponse.json({ error: "Request failed" }, { status })
}
