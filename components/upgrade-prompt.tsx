import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SUBSCRIPTION_TIERS } from "@/lib/constants/iep"
import type { SubscriptionTier } from "@/lib/types/iep"

/** Shown wherever lib/entitlements.ts says the user's tier doesn't cover a feature. */
export function UpgradePrompt({ message, requiredTier }: { message: string; requiredTier: SubscriptionTier }) {
  const plan = SUBSCRIPTION_TIERS[requiredTier]

  return (
    <Card role="status" className="border-dashed border-[#3C9C87]/40">
      <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-semibold">Available on {plan.name} and above</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Button asChild className="bg-[#3C9C87] hover:bg-[#2d7a6a] shrink-0">
          <Link href="/iep/settings/subscription">See plans</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
