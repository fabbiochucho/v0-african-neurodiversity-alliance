import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// GET /api/health
//
// Liveness check for uptime monitoring (see DEPLOYMENT_GUIDE.md). Deliberately
// doesn't touch Supabase/Flutterwave/Resend - it only confirms this app's own
// server is up and able to respond, so a downstream outage doesn't also flip
// this app's health check to red.
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() })
}
