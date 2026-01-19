-- Create reports table
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  generated_by uuid not null references public.profiles(id),
  report_type text,
  report_period text,
  content text,
  pdf_url text,
  email_sent boolean default false,
  email_sent_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.reports enable row level security;

create policy "reports_select_own"
  on public.reports for select
  using (
    exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = reports.learner_id
      and learner_profiles.user_id = auth.uid()
    ) or generated_by = auth.uid()
  );

create policy "reports_insert_own"
  on public.reports for insert
  with check (generated_by = auth.uid());
