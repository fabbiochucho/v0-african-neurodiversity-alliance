-- Create progress logs table
create table if not exists public.progress_logs (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.iep_goals(id) on delete cascade,
  logged_by uuid not null references public.profiles(id),
  rating integer check (rating >= 1 and rating <= 5),
  notes text,
  logged_date date default now(),
  created_at timestamp with time zone default now()
);

alter table public.progress_logs enable row level security;

create policy "progress_logs_select_via_goal"
  on public.progress_logs for select
  using (
    exists (
      select 1 from public.iep_goals
      join public.ieps on ieps.id = iep_goals.iep_id
      join public.learner_profiles on learner_profiles.id = ieps.learner_id
      where iep_goals.id = progress_logs.goal_id
      and (learner_profiles.user_id = auth.uid() or ieps.created_by = auth.uid())
    )
  );

create policy "progress_logs_insert_via_goal"
  on public.progress_logs for insert
  with check (logged_by = auth.uid());

-- Create weekly summaries table
create table if not exists public.progress_summaries (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  week_start_date date,
  week_end_date date,
  summary_text text,
  domain_progress jsonb default '{}',
  created_at timestamp with time zone default now()
);

alter table public.progress_summaries enable row level security;

create policy "progress_summaries_select_own"
  on public.progress_summaries for select
  using (
    exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = progress_summaries.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );
