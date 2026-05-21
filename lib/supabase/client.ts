import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null
const isClient = typeof window !== 'undefined'

export function createClient() {
  // Only use singleton on client side
  if (!isClient) {
    // Server-side: create new instance each time to avoid state sharing
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Client-side: use singleton to prevent multiple instances
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            'User-Agent': 'ANDA/1.0.0',
          },
        },
      }
    )
  }

  return supabaseClient
}
