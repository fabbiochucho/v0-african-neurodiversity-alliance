import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Service-role Supabase client for server-only payment flows (Flutterwave
 * initialize/verify/webhook, anonymous donations, and any other write that
 * must succeed regardless of the caller's auth state). This bypasses Row
 * Level Security entirely.
 *
 * NEVER import this from a Client Component or expose it to the browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase service role configuration (SUPABASE_SERVICE_ROLE_KEY)")
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
