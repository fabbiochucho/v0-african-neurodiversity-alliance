// Content-Security-Policy built per request in middleware.ts. Scripts must
// carry this request's nonce; 'strict-dynamic' lets those scripts load the
// rest (Next.js chunks, Vercel Analytics, Cloudflare Turnstile), so no inline
// script runs unless the server stamped it.
export function buildCsp(nonce: string) {
  const dev = process.env.NODE_ENV !== "production"
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
  ].join("; ")
}
