-- Richer Find Support directory (2026-10-23): where exactly, for which ages,
-- which services, and for schools the curriculum and class size. Every new
-- field is optional: it is filled only from the provider's own website or an
-- official listing (source_url), never guessed. last_verified_at records
-- when those details were last checked.

alter table public.resources
  add column if not exists city text,
  add column if not exists region text,
  add column if not exists address text,
  add column if not exists age_min smallint check (age_min between 0 and 120),
  add column if not exists age_max smallint check (age_max between 0 and 120),
  add column if not exists services text[] not null default '{}',
  add column if not exists curriculum text[] not null default '{}',
  add column if not exists class_size_avg smallint check (class_size_avg between 1 and 200),
  add column if not exists provider_type text check (provider_type in ('public', 'private', 'ngo', 'faith', 'university')),
  add column if not exists languages text[] not null default '{}',
  add column if not exists source_url text,
  add column if not exists last_verified_at date;

alter table public.resources
  add constraint resources_age_range check (age_min is null or age_max is null or age_min <= age_max),
  add constraint resources_category check (category in ('school', 'therapist', 'healthcare', 'specialist', 'support_group', 'caregiver'));

create index if not exists resources_services_idx on public.resources using gin (services);
create index if not exists resources_curriculum_idx on public.resources using gin (curriculum);
