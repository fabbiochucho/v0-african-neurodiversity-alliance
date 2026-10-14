-- AI Companion rate limiting (audit item F.6).
--
-- One row per message sent to the companion, holding ONLY who and when:
-- no message content, no model output, no learner data. Used to enforce
-- the per-tier daily cap and the per-minute burst cap in
-- app/api/companion/route.ts.
--
-- Users may read and insert their own rows only. There is deliberately no
-- UPDATE or DELETE policy, so a user can't reset their own usage count.
create table if not exists public.ai_companion_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_ai_companion_usage_user_created
  on public.ai_companion_usage(user_id, created_at desc);

alter table public.ai_companion_usage enable row level security;

create policy "ai_companion_usage_select_own"
  on public.ai_companion_usage for select
  using (user_id = auth.uid());

-- created_at must be "now" so a user can't backdate rows out of the window.
create policy "ai_companion_usage_insert_own"
  on public.ai_companion_usage for insert
  with check (user_id = auth.uid() and created_at >= now() - interval '1 minute' and created_at <= now() + interval '1 minute');
