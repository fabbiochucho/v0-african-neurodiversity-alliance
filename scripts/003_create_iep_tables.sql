-- Create learner profiles table
create table if not exists public.learner_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  age integer,
  gender text,
  country text,
  diagnosis_domains jsonb default '[]',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.learner_profiles enable row level security;

create policy "learner_profiles_select_own"
  on public.learner_profiles for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and (profiles.id = learner_profiles.user_id or profiles.organization_id is not null)
    )
  );

create policy "learner_profiles_insert_own"
  on public.learner_profiles for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
    )
  );

create policy "learner_profiles_update_own"
  on public.learner_profiles for update
  using (user_id = auth.uid());

-- Create IEPs table
create table if not exists public.ieps (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  title text,
  description text,
  status text default 'draft',
  adaptive_goals jsonb default '[]',
  custom_goals jsonb default '[]',
  ai_summary text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.ieps enable row level security;

create policy "ieps_select_own"
  on public.ieps for select
  using (
    exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = ieps.learner_id
      and learner_profiles.user_id = auth.uid()
    ) or created_by = auth.uid()
  );

create policy "ieps_insert_own"
  on public.ieps for insert
  with check (created_by = auth.uid());

create policy "ieps_update_own"
  on public.ieps for update
  using (created_by = auth.uid());

-- Create goals table
create table if not exists public.iep_goals (
  id uuid primary key default gen_random_uuid(),
  iep_id uuid not null references public.ieps(id) on delete cascade,
  goal_text text not null,
  domain text,
  status text default 'in_progress',
  target_completion_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.iep_goals enable row level security;

create policy "iep_goals_select_via_iep"
  on public.iep_goals for select
  using (
    exists (
      select 1 from public.ieps
      where ieps.id = iep_goals.iep_id
      and (
        exists (
          select 1 from public.learner_profiles
          where learner_profiles.id = ieps.learner_id
          and learner_profiles.user_id = auth.uid()
        ) or ieps.created_by = auth.uid()
      )
    )
  );

create policy "iep_goals_insert_via_iep"
  on public.iep_goals for insert
  with check (
    exists (
      select 1 from public.ieps
      where ieps.id = iep_goals.iep_id
      and ieps.created_by = auth.uid()
    )
  );
