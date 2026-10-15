import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { buildCsp } from "@/lib/csp"

// Session refresh only runs on routes that read auth state. Every one of
// these already does its own supabase.auth.getUser() check server-side, so
// this isn't the only thing gating access -- it refreshes the session cookie
// for logged-in users in the app shell. Public pages skip it to save a
// Supabase round-trip.
const SESSION_PATHS = [
  "/protected",
  "/dashboard",
  "/journey",
  "/account",
  "/people",
  "/plan",
  "/welcome",
  "/team",
  "/companion",
  "/team-dashboard",
  "/screening",
  "/learners",
  "/export",
  "/iep",
  "/settings",
  "/connect",
]

const needsSession = (path: string) => SESSION_PATHS.some((p) => path === p || path.startsWith(`${p}/`))

export async function middleware(request: NextRequest) {
  // Every page gets a fresh nonce; Next.js reads it from this request header
  // and stamps its own scripts with it.
  const nonce = btoa(crypto.randomUUID())
  const csp = buildCsp(nonce)
  request.headers.set("x-nonce", nonce)
  request.headers.set("Content-Security-Policy", csp)

  const response = needsSession(request.nextUrl.pathname)
    ? await updateSession(request)
    : NextResponse.next({ request })
  response.headers.set("Content-Security-Policy", csp)
  return response
}

export const config = {
  matcher: [
    {
      // Pages only: not API routes, build assets or static files.
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|webmanifest)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
