import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { EmptyState } from "@/components/empty-state"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <EmptyState
          title="We couldn't find that page."
          description="It may have moved, or you may not have access to it. Nothing has been lost."
          actions={[
            { label: "Go to your dashboard", href: "/dashboard" },
            { label: "Home", href: "/" },
          ]}
        />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Looking for support near you?{" "}
          <Link href="/directory" className="text-primary hover:underline">
            Find Support
          </Link>
        </p>
      </main>
    </div>
  )
}
