"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Calm error state for any page (brief §55-56): no raw errors or codes.
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("page error", error.digest ?? "")
  }, [error])

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 bg-background">
      <div role="alert" className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Something didn&apos;t save.</h1>
        <p className="text-muted-foreground">Your information is still here. Try again.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to your dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
