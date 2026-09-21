// Phase 1 cross-app integration (see scripts/010_create_linked_accounts.sql).
//
// This app ("alliance") and the sibling "Neu Rafiki" app can optionally link
// user accounts so completed Neu Rafiki assessments can be imported into an
// Alliance IEP learner profile, and Alliance's resource directory can be read
// from Neu Rafiki. Everything here is opt-in: if NEXT_PUBLIC_NEURAFIKI_APP_URL
// is unset, federation is considered disabled and this app behaves exactly as
// it did before Phase 1.

export function isFederationEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_NEURAFIKI_APP_URL)
}

export function getSiblingAppUrl(): string | null {
  return process.env.NEXT_PUBLIC_NEURAFIKI_APP_URL || null
}

export const THIS_APP_ID = "alliance" as const
export const SIBLING_APP_ID = "neurafiki" as const

// Human-readable descriptions shown on the /connect consent screen and the
// settings/connections page for each federation scope.
//
// directory_read intentionally isn't a scope here: Alliance's resource
// directory (GET /api/resources) is already fully public with no auth
// check, so a "scope" gating it would control nothing real -- it would just
// mislead users into thinking they're authorizing access to something that
// was never access-controlled in the first place.
const SCOPE_DESCRIPTIONS: Record<string, string> = {
  assessment_sync: "Import your completed Neu Rafiki assessment results into your Alliance IEP profile",
}

export function describeScope(scope: string): string {
  return SCOPE_DESCRIPTIONS[scope] || scope
}
