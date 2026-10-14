-- AI Companion, round 2 (audit item F.6).
--
-- 1. Per-learner consent to include learner data in AI chat, as an
--    append-only event log: every grant and every withdrawal is a row with
--    a timestamp and the consent text version. The latest event decides.
--    There are no UPDATE or DELETE policies, so history can't be rewritten
--    and a withdrawal takes effect from the next message.
--    Only the learner's owner (the person who created their profile) can
--    grant or withdraw; support-team members cannot share a learner's data.
--
-- 2. Enforce the Pro gate on the usage table in the database too
--    (depends on public.tier_allows from scripts/032).

create table if not exists public.ai_learner_consent_events (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('granted', 'revoked')),
  consent_version text not null,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_ai_consent_learner on public.ai_learner_consent_events(learner_id, created_at desc);

alter table public.ai_learner_consent_events enable row level security;

create policy "ai_consent_select_own"
  on public.ai_learner_consent_events for select
  using (user_id = auth.uid());

create policy "ai_consent_insert_owner"
  on public.ai_learner_consent_events for insert
  with check (
    user_id = auth.uid()
    and created_at >= now() - interval '1 minute'
    and created_at <= now() + interval '1 minute'
    and exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = ai_learner_consent_events.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );

-- Chat messages (usage rows) require Pro or above.
drop policy if exists "ai_companion_usage_insert_own" on public.ai_companion_usage;

create policy "ai_companion_usage_insert_own"
  on public.ai_companion_usage for insert
  with check (
    user_id = auth.uid()
    and public.tier_allows(auth.uid(), 'pro') -- gate:ai_companion
    and created_at >= now() - interval '1 minute'
    and created_at <= now() + interval '1 minute'
  );
