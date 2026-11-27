import { Navigation } from "@/components/navigation"
import { getSiblingAppUrl, isFederationEnabled } from "@/lib/federation/config"
import { AdultCheck } from "./adult-check"

export const metadata = {
  title: "Adult self-check: could I be neurodivergent? | ANDA",
  description:
    "For adults who were never assessed: questions on attention, social life, senses, reading, numbers and coordination, with clear next steps. Not a diagnosis.",
}

export default function AdultCheckPage() {
  const neuRafiki = isFederationEnabled() ? getSiblingAppUrl() : null
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <AdultCheck neuRafikiUrl={neuRafiki} />
        </div>
      </main>
    </div>
  )
}
