import Link from "next/link"
import { Navigation } from "@/components/navigation"

export const metadata = { title: "Newsletter | ANDA", robots: { index: false } }

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const done = status === "unsubscribed"
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto max-w-xl px-4 py-16 space-y-4">
        <h1 className="text-3xl font-bold">{done ? "You're unsubscribed" : "That link didn't work"}</h1>
        <p className="text-muted-foreground">
          {done
            ? "You won't get the ANDA newsletter any more. This doesn't change your account or any other emails you've chosen."
            : "The unsubscribe link may be incomplete. Use the link in your latest newsletter, or turn the newsletter off on your account's Privacy page."}
        </p>
        <p>
          <Link href="/account/privacy" className="text-primary underline">
            Your email settings
          </Link>
        </p>
      </main>
    </div>
  )
}
