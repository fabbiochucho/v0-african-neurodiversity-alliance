# Architecture

> **Provider (Oct 2026):** AI runs through `lib/ai.ts`. Free Cloudflare Workers AI (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_AI_TOKEN`, default model Llama 3.3 70B) is used when configured; Anthropic (`ANTHROPIC_API_KEY`) only if Cloudflare is not set. The consent screen names whichever provider is active, and switching provider asks families to consent again.

ANDA (African Neurodiversity Alliance) is a Next.js 14 App Router app backed by Supabase, deployed on Vercel at anda.becomechange.institute.

## Runtime pieces

| Piece | What it is | Where |
|---|---|---|
| Web app | Next.js 14 (App Router, React 18, Tailwind v4, shadcn/ui) | `app/`, `components/` |
| Database and auth | Supabase project `exhgecucrtbzjrpnqtht` (Postgres + RLS, Auth, Storage) | `scripts/NNN_*.sql`, `lib/supabase/` |
| Payments | Flutterwave and Paystack, server routes only | `app/api/payments/*`, `lib/payments/` |
| Email | Resend (report emails, support-team invites) | `app/api/reports/send-email`, `lib/support-team-invite.ts` |
| AI | Anthropic API, server-side only, `ANTHROPIC_MODEL` (default `claude-haiku-5-5`) | `app/api/companion`, `app/api/plan/[learnerId]` |
| Sibling app | NeuRafiki (assessments, check-ins), its own Supabase project `eyouboihrzqtmvkbmais` | `lib/federation/` |

## Request flow

- **Pages** are server components by default. They create a per-request Supabase client from the user's cookies (`lib/supabase/server.ts`), so **RLS decides what each person sees**. Interactive parts are small client components.
- **API routes** (`app/api/**/route.ts`):
  - They re-check auth and entitlements, then write through the same RLS-scoped client.
  - The **service-role client** (`lib/supabase/service.ts`) is used only where no end user is the caller, or where a user must not write directly:
    - payment webhooks and verification
    - NeuRafiki federation calls
    - the audit log
    - server-only data kinds (`assessment`, `check_in`)
    - account deletion
- **Middleware** (`middleware.ts`) only refreshes the Supabase session on signed-in sections. Every page and route still checks auth itself.

## Main areas

| Path | Purpose |
|---|---|
| `/dashboard` | Person-centred dashboard: one card per learner, NeuRafiki actions, invitations |
| `/journey/[id]` | Timeline, check-ins, daily micro-log, What changed?, reports, support team |
| `/journey/[id]/profile` | Support profile, existing assessments, localisation |
| `/plan/[id]` | 12-step IEP flow with drafts, approval and versions |
| `/journey/[id]/report`, `/journey/[id]/review-pack` | Weekly/monthly/quarterly/What changed? reports; review pack |
| `/companion` | Rule-based prompts (all tiers) and optional AI chat (Pro+, consent-gated) |
| `/account`, `/account/privacy` | Separate ANDA and NeuRafiki plans; consents, audit log, export, deletion |
| `/settings/accessibility` | Sensory/display preferences |
| `/screening`, `/team-dashboard`, `/learners/import`, `/export`, `/settings/branding` | Tier-gated tools |
| `/welcome/from-neurafiki` | "Continue to ANDA" handoff |

## Cross-app contract with NeuRafiki

The accounts are linked through Ed25519-signed JWTs (`lib/federation/jwt.ts`, the `linked_accounts` table). Every token carries `requesting_user_id`, `target_remote_user_id` and `scope`, and expires after 2 minutes. The issuer is `alliance` (ANDA) or `neurafiki`.

| Direction | Endpoint | Scope |
|---|---|---|
| NeuRafiki → ANDA | `GET /api/federation/entitlements` | `entitlements` |
| ANDA → NeuRafiki | `GET {NEURAFIKI_URL}/api/federation/entitlements` (cached 5 min) | `entitlements` |
| NeuRafiki → ANDA | `POST /api/federation/check-in-summary` | `check_in_summary` |
| ANDA → NeuRafiki | `GET {NEURAFIKI_URL}/api/federation/assessment-results` | `assessment_sync` |

Deep links (`lib/federation/contract.ts`):
- `/check-in?from=anda&learner=<ANDA learner id>&goal=<title>`
- `/assessment/start?from=anda`
- `/account`
- NeuRafiki → ANDA: `/welcome/from-neurafiki?assessment=<id>`

Billing is separate: each product only *describes* its plan to the other.

## Code map

- `lib/entitlements.ts`: tiers, gates and the entitlement resolver (see `ENTITLEMENTS.md`)
- `lib/journey.ts`, `lib/journey-data.ts`: person summary and timeline
- `lib/progress-status.ts`, `lib/report-builder.ts`: progress words and reports
- `lib/iep-plan.ts`, `lib/plan-data.ts`: the full IEP
- `lib/team-permissions.ts`, `lib/support-team.ts`: support-team permissions
- `lib/companion.ts`, `lib/companion-nudges.ts`: companion safety, consent, nudges
- `lib/preferences.ts`, `lib/i18n/`: sensory preferences and localisation
- `tests/unit/`: Vitest. `pnpm test`, `pnpm lint`, `pnpm build`.
