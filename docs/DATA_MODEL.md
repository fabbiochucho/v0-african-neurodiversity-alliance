# Data model

All tables live in Supabase Postgres (`public` schema) with Row Level Security on. Migrations are numbered SQL files in `scripts/`; apply them in numeric order. "Owner" means the user who created the learner (`learner_profiles.user_id`). "Member" means an active support-team member.

## Tables

| Table | Holds | Who can read | Who can write |
|---|---|---|---|
| `profiles` | One row per user | self | self |
| `learner_profiles` | People being supported, including localisation fields (046) | owner; members with `view` | owner; learner cap trigger (032) |
| `learner_records` (042) | Append-only records, each with a **data kind** | owner; members with `view` | owner: observation/professional_input; members with `add_observation`: observations; server: assessment/check_in |
| `ieps` | Plans | owner; members with `view` | owner |
| `iep_goals` | Goals with baseline, target, measurement, frequency, responsible person, support strategy, review date, evidence, `source`, `approval_status`, `approved_by/at` (030, 045) | owner; members with `view` | owner; `manage_plan`/`suggest_goal` for drafts and suggestions; approval only via `approve_plan_items()` |
| `iep_plan_items` (045) | Plan sections (accommodations ... timeline) with source and approval | `view` | `manage_plan` (drafts), `suggest_goal` (suggestions); approved items are immutable |
| `iep_plan_versions` (045) | Snapshot saved on every approval | `view` | `approve_plan_items()` only |
| `progress_logs` | 1–5 check-ins | owner; `view` | owner; `log_progress` |
| `progress_summaries` | 30-day snapshots | owner; `view` | owner |
| `reports` | Saved text reports | owner; `generate_report` | owner (Premium+, 032) |
| `support_team_members` | Invites and memberships, `permissions[]` (044), invite token hash and expiry (034) | owner, member, invitee by email | owner or `invite` holder inserts; accepted and edited only via security-definer functions; no UPDATE policy |
| `ai_companion_usage` (029, 033) | (user, time) per AI chat message | self | self, Pro+ |
| `ai_learner_consent_events` (033) | Append-only consent grants and withdrawals with version | self | owner of the learner |
| `screenings` (035) | Non-diagnostic quick screens and NeuRafiki-reported areas | owner | owner (in-depth: Premium+) |
| `branding_settings` (035) | Org name, accent colour, logo path | self | self, Pro+ |
| `user_preferences` (043) | Sensory and display settings | self | self |
| `audit_log` (043) | Who viewed, exported or changed a learner's records | record owner | **server only** (service role) |
| `subscriptions`, `payment_transactions` | Billing | self | server only; users insert `pending` checkout rows only (028); `user_id` set null on account deletion (043) |
| `linked_accounts` | NeuRafiki link | self | self |

## Data kinds

Every piece of information about a learner says where it came from (`lib/learner-records.ts`, `components/data-kind-badge.tsx`):

| Kind | Meaning | Written by |
|---|---|---|
| `observation` | Family, carer or the person (support profile); also check-in ratings in reports | users |
| `professional_input` | Existing diagnosis, school assessment or plan, with an optional private file | owner |
| `assessment` | NeuRafiki assessment summary (domain areas and NeuRafiki's reported levels only) | server, after a consented import |
| `check_in` | NeuRafiki check-in summary (option values only, no free text) | server, from the signed federation POST |
| AI interpretation | AI-drafted plan text. **Never** stored as a record; lives in plan tables with `source='ai'` until a person approves it | server |

## Storage buckets

| Bucket | Access | Contents |
|---|---|---|
| `learner-files` (042) | private; owner-only read/write under `<user_id>/`; signed URLs | assessment documents (PDF/PNG/JPEG, ≤10 MB) |
| `branding` (035) | public read; owner-only write under `<user_id>/`, Pro+ | logos (PNG/JPEG/WebP, ≤512 KB, no SVG) |

## Key database functions

| Function | Purpose |
|---|---|
| `entitled_tier(user)`, `tier_allows(user, tier)` | The entitlement rule (see `ENTITLEMENTS.md`) |
| `has_permission(learner, perm)` | Owner, or active member holding `perm` whose owner is on Pro+ |
| `approve_plan_items(...)` | The only way to approve plan content; saves a version |
| `accept_support_team_invite(...)`, `refresh_support_team_invite(...)`, `set_member_permissions(...)` | Team changes without UPDATE policies |
