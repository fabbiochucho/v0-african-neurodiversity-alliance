# Rules for coding agents

Read these before changing ANDA. `docs/` has the detail.

- **Data:** every table has RLS. A new table needs RLS on and policies that check ownership (`auth.uid()` or `has_permission()`), never just "signed in". Signed-out visitors have no grants by default (migration 049): grant `anon` explicitly only for public content.
- **Keys:** only `NEXT_PUBLIC_SUPABASE_ANON_KEY` may reach the browser. The service role key, payment, email, AI and cron secrets stay in server code; never put them in a `NEXT_PUBLIC_` variable.
- **Children and health:** profiles are often about children and their development. No ad pixels, session replay, or third-party SDKs that capture what people type. Analytics gets page paths only (`components/analytics.tsx`).
- **AI:** AI features need the person's consent (`docs/AI_BEHAVIOUR.md`). Chat starts with an "AI, not a person" notice. Never send surnames, dates of birth, documents or reports.
- **New vendor, script, SDK or font:** update the processors list in `app/privacy/page.tsx`, `docs/PRIVACY_DATA_FLOW.md` and the CSP in `lib/csp.ts` in the same PR, and bump `LEGAL_UPDATED`. Fonts stay self-hosted through `next/font`.
- **Accessibility:** build to WCAG 2.2 AA (see `/accessibility`).
- **Packages:** check every new package exists and is the one you meant before adding it. Commit the lockfile.
- **Legal text:** the DPO clause in `lib/dpo.ts` is verbatim and test-guarded; don't edit it.
- **Payments:** a plan is paid per period and never renews automatically. Don't add wording that says it does.
