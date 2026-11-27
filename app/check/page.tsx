import { Navigation } from "@/components/navigation"
import { EarlyCheck } from "./early-check"

export const metadata = {
  title: "Early development check (12 to 36 months) | ANDA",
  description:
    "A free check for families: questions about how a young child plays, communicates and responds, with clear next steps. Not a diagnosis.",
}

export default function CheckPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <EarlyCheck />
        </div>
      </main>
    </div>
  )
}
