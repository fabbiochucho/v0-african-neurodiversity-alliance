import { notFound } from "next/navigation"
import type { ReactNode } from "react"

// Every page under /test/* is a manual QA console (raw Supabase auth/IEP/
// payment forms, live Flutterwave test-card flow) meant for local
// development only. Gate the whole segment here instead of in each page so
// none of them can accidentally ship reachable on a production deployment.
export default function TestLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV !== "development") {
    notFound()
  }

  return children
}
