# Entitlements

`lib/entitlements.ts` is the single source of truth for what each ANDA plan unlocks. The pricing pages are generated from it, so they can only advertise what is enforced. ANDA and NeuRafiki bill separately: nothing in one product grants the other's features.

## Plans

| Plan | Price | Learner profiles |
|---|---|---|
| Free | $0 | 1 |
| Premium | $4.99 / month | 3 |
| Pro | $9.99 / month | 10 |
| Institutional | $99 / year | 50 |

## Feature gates (`FEATURE_MIN_TIER`)

| Feature | Minimum plan | Enforced in |
|---|---|---|
| `screening` (quick, non-diagnostic) | Free | API + RLS |
| `screening_in_depth` (NeuRafiki results) | Premium | API + RLS |
| `reports` (monthly/quarterly/What changed?) | Premium | API, pages, RLS on `reports` |
| `email_reports` | Pro | API + trigger on `reports.email_sent` |
| `support_team` | Pro | API, RLS on invites, `has_permission()` (members lose access when the owner's plan lapses) |
| `ai_companion` (AI chat, AI plan drafting) | Pro | API + RLS on usage rows |
| `team_dashboard` | Pro | page (read-only) |
| `branding` | Pro | API, table RLS, Storage policies |
| `bulk_enrollment` | Institutional | API (learner cap trigger still applies) |
| `data_export` | Institutional | API (owner-only reads) |

The companion's rule-based prompts, weekly summaries, check-ins, My Journey, support profiles and the 12-step plan flow (with templates) are available on every plan.

## The entitlement rule

A paid plan counts only if **all** of these hold:
- the subscription is `active`
- its `renewal_date` is in the future
- it has a **successful** `payment_transactions` row (users can't create those)

Everything else (pending, cancelled, expired, unpaid) is **Free**. Errors fail closed to Free.

- **TypeScript:** `effectiveTier()` and `getEntitlement()`. `getEntitlement()` calls the database function first, and falls back to the identical TypeScript rule until migration 032 is applied.
- **SQL (032):**
  - `entitled_tier(user)` returns the tier name (security definer)
  - `tier_allows(user, min_tier)`
  - `tier_rank()` and `learner_limit()`
  - a learner-cap trigger (advisory-locked per owner)
  - gates on report inserts and on marking a report emailed

  Later migrations gate their own inserts with `tier_allows(...) -- gate:<feature>`.
- **Drift test:** `tests/unit/entitlements-sql.test.ts` fails if the SQL caps, ranks or gates differ from the TypeScript ones.

## Upgrade prompts

Gated routes return `402 {code: "upgrade_required", required_tier}`. Pages show `components/upgrade-prompt.tsx`. Nothing is auto-granted.
