-- Self-service directory listings (2026-10-23): the "Suggest an organisation"
-- form collects the same detail fields as listings (scripts/053), and admins
-- review submissions on /admin/submissions before anything is published.

alter table public.resource_submissions
  add column if not exists region text,
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists age_min smallint check (age_min between 0 and 120),
  add column if not exists age_max smallint check (age_max between 0 and 120),
  add column if not exists services text[] not null default '{}',
  add column if not exists curriculum text[] not null default '{}',
  add column if not exists class_size_avg smallint check (class_size_avg between 1 and 200),
  add column if not exists provider_type text check (provider_type in ('public', 'private', 'ngo', 'faith', 'university')),
  add column if not exists submitter_role text check (submitter_role in ('provider', 'parent', 'professional', 'other')),
  add column if not exists accurate_and_public boolean not null default false,
  add column if not exists reviewed_at timestamp with time zone,
  add column if not exists reviewed_by text,
  add column if not exists resource_id uuid references public.resources(id) on delete set null;

-- Keep public suggestions a sensible size.
alter table public.resource_submissions
  add constraint resource_submissions_bounds check (
    char_length(name) <= 200
    and char_length(coalesce(description, '')) <= 2000
    and char_length(coalesce(address, '')) <= 300
    and char_length(coalesce(city, '')) <= 100
    and char_length(coalesce(region, '')) <= 100
    and cardinality(services) <= 20
    and cardinality(curriculum) <= 10
  );

-- Visitors may only add new, pending suggestions they've confirmed are
-- accurate and publishable; they can never mark one reviewed or published.
drop policy if exists "resource_submissions_insert_anyone" on public.resource_submissions;
create policy resource_submissions_insert_pending on public.resource_submissions
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and accurate_and_public
    and reviewed_at is null
    and reviewed_by is null
    and resource_id is null
  );
