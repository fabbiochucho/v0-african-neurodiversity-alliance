import Link from "next/link"
import { neuRafikiLinks } from "@/lib/federation/contract"

/**
 * NeuRafiki inside ANDA (brief §14, §47). Deep links follow the cross-app
 * contract; nothing here grants anything in either product. Where a step
 * needs a plan the person doesn't have, the label says so and the page
 * shows an upgrade prompt.
 */
export function NeuRafikiActions({
  learnerId,
  goalTitle,
  nrUrl,
  linked,
  canReports,
}: {
  learnerId: string
  goalTitle?: string
  nrUrl: string | null
  linked: boolean
  canReports: boolean
}) {
  const nr = nrUrl ? neuRafikiLinks(nrUrl) : null
  const item = "rounded-md border px-3 py-1.5 text-sm hover:bg-accent"

  return (
    <nav aria-label="Next actions" className="flex flex-wrap gap-2">
      {nr && linked ? (
        <a href={nr.checkIn(learnerId, goalTitle)} className={item}>
          Check in with NeuRafiki
        </a>
      ) : nr ? (
        <Link href="/settings/connections" className={item}>
          Connect NeuRafiki to check in
        </Link>
      ) : null}
      <Link href={`/plan/${learnerId}`} className={item}>
        Review my goals
      </Link>
      <Link href={`/journey/${learnerId}/report?kind=changes`} className={item}>
        What changed?{!canReports && <span className="text-muted-foreground"> (Premium)</span>}
      </Link>
      <Link href={`/journey/${learnerId}/review-pack`} className={item}>
        Prepare for review
      </Link>
      <a href={nr ? nr.assessment() : "/self-test"} className={item}>
        Update assessment
      </a>
    </nav>
  )
}
