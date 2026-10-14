-- Round 3, PR G: sensory preferences (brief §31) and privacy (brief §42).

-- ---- 1. Sensory / display preferences -----------------------------------------
-- Signed-out visitors keep these in localStorage only. Every value is the
-- user's own presentation choice; there are no ownership or payment fields.
create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  visual text not null default 'balanced' check (visual in ('calm', 'balanced', 'vibrant')),
  motion text not null default 'standard' check (motion in ('reduced', 'standard')),
  text_size text not null default 'standard' check (text_size in ('standard', 'large', 'xl')),
  contrast text not null default 'standard' check (contrast in ('standard', 'high')),
  density text not null default 'standard' check (density in ('spacious', 'standard', 'compact')),
  updated_at timestamp with time zone not null default now()
);

alter table public.user_preferences enable row level security;

create policy "user_preferences_select_own" on public.user_preferences for select using (user_id = auth.uid());
create policy "user_preferences_insert_own" on public.user_preferences for insert with check (user_id = auth.uid());
create policy "user_preferences_update_own" on public.user_preferences for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- 2. Audit log ---------------------------------------------------------------
-- Who viewed, exported or changed which learner's records. Written ONLY by
-- server routes with the service role (no insert policy for users), so
-- entries can't be forged or removed. Readable by the learner's owner.
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete cascade,
  learner_id uuid references public.learner_profiles(id) on delete set null,
  action text not null check (action in ('view', 'export', 'change', 'delete')),
  resource text not null check (char_length(resource) <= 200),
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_audit_log_owner on public.audit_log(owner_id, created_at desc);

alter table public.audit_log enable row level security;

create policy "audit_log_select_owner" on public.audit_log for select using (owner_id = auth.uid());

-- ---- 3. Account deletion keeps financial records --------------------------------
-- Deleting a user must not delete their payment history: subscriptions
-- (and through them payment_transactions) keep their rows with user_id
-- set to null. Check-ins a support-team member logged on someone else's
-- learner also survive with logged_by set to null.
do $$
declare c text;
begin
  select conname into c from pg_constraint
  where conrelid = 'public.subscriptions'::regclass and contype = 'f' and pg_get_constraintdef(oid) like 'FOREIGN KEY (user_id)%';
  if c is not null then execute format('alter table public.subscriptions drop constraint %I', c); end if;

  select conname into c from pg_constraint
  where conrelid = 'public.progress_logs'::regclass and contype = 'f' and pg_get_constraintdef(oid) like 'FOREIGN KEY (logged_by)%';
  if c is not null then execute format('alter table public.progress_logs drop constraint %I', c); end if;
end $$;

alter table public.subscriptions alter column user_id drop not null;
alter table public.subscriptions
  add constraint subscriptions_user_id_fkey foreign key (user_id) references public.profiles(id) on delete set null;

alter table public.progress_logs alter column logged_by drop not null;
alter table public.progress_logs
  add constraint progress_logs_logged_by_fkey foreign key (logged_by) references public.profiles(id) on delete set null;
