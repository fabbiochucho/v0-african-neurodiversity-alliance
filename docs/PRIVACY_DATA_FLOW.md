# Privacy and data flow

> **Provider (Oct 2026):** AI runs through `lib/ai.ts`. Free Cloudflare Workers AI (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_AI_TOKEN`, default model Llama 3.3 70B) is used when configured; Anthropic (`ANTHROPIC_API_KEY`) only if Cloudflare is not set. The consent screen names whichever provider is active, and switching provider asks families to consent again.

ANDA is designed to support applicable data-protection requirements. This document describes what actually happens to data. It makes no claim of compliance with any specific law.

## Where data lives

| Data | Where | Notes |
|---|---|---|
| Accounts, learners, plans, check-ins, records, consents, audit log | Supabase project `exhgecucrtbzjrpnqtht` (Postgres, RLS on every table) | owner/team access through RLS and `has_permission()` |
| Uploaded assessment documents | Supabase Storage `learner-files` (private) | owner-only; served through 60-second signed URLs |
| Logos | Supabase Storage `branding` (public read) | contains no personal data |
| Display preferences | browser localStorage and `user_preferences` | presentation choices only |
| NeuRafiki data | NeuRafiki's own Supabase project `eyouboihrzqtmvkbmais` | only the summaries below cross into ANDA |

## What leaves ANDA, and when

| To | What | When |
|---|---|---|
| Anthropic | Chat messages; with consent, a learner's first name, active goals, 30-day summary and support profile text (plan drafting) | Only when a Pro user uses AI chat or AI drafting (see `AI_BEHAVIOUR.md`) |
| NeuRafiki | A signed request naming the linked user; ANDA's plan description (`GET /api/federation/entitlements`) | Only for linked accounts |
| Resend | Recipient email, report text, invite links | When someone emails a report or invites a team member |
| Flutterwave / Paystack | Email and payment details for checkout | When someone subscribes or donates |

## What comes into ANDA from NeuRafiki

- **Assessment summaries:**
  - Domain areas, plus the level NeuRafiki reported for each.
  - Only after the user links the accounts and chooses to import ("Continue to ANDA" → `/welcome/from-neurafiki`).
  - Stored as data kind `assessment`.
  - Raw assessment responses are never transferred.
- **Check-in summaries** (`POST /api/federation/check-in-summary`):
  - A learner ref, date, goal title, a short summary, and answers that are **option values only** (numbers, yes/no or short codes). Free text is rejected.
  - Sent only when the user consents on NeuRafiki's side (wording version `check-in-share-1.0`), for an actively linked account.
  - Stored as data kind `check_in`.

## People's controls (`/account/privacy`)

- See and withdraw every consent:
  - AI learner sharing
  - support-team access (both granted and received)
  - the NeuRafiki link
- See the audit log of who viewed, exported or changed a learner's records. Entries are written only by the server and can't be edited by users.
- Export data as CSV or JSON (Institutional plan; owner's own learners only).
- **Delete the account:**
  - A confirm step: retype your email.
  - The server deletes Storage files, learners and everything under them, consents, team memberships, and then the login.
  - **Payment records are kept for financial records**, with the user link removed (`subscriptions.user_id` set to null).

## Retention

- AI chat: nothing stored.
- Records are append-only for traceability; the owner can delete them.
- Invite tokens: stored only as SHA-256 hashes, and expire after 7 days.
