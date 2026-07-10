import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Session-refresh middleware only needs to run on routes that actually
    // read auth state. Every one of these already does its own independent
    // supabase.auth.getUser() check server-side (see app/protected/page.tsx,
    // app/iep/*/page.tsx, app/settings/connections/page.tsx, app/connect/page.tsx),
    // so this isn't the only thing gating access -- it's here to refresh the
    // session cookie for logged-in users navigating the authenticated app
    // shell. Public marketing pages, /auth/*, and every /api/* route (each of
    // which creates its own Supabase client and checks auth internally) never
    // need this, so excluding them removes an unnecessary Supabase network
    // round-trip from nearly every page load on the site.
    "/protected/:path*",
    "/iep/:path*",
    "/settings/:path*",
    "/connect",
  ],
}
