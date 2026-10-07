-- Public support directory, replacing the hardcoded mockResources array
-- previously used by app/directory/page.tsx.
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null default 'support_group', -- school | therapist | support_group | healthcare | caregiver
  country text,
  location text,
  url text,
  contact_info jsonb default '{}', -- { phone?, email?, website? }
  specialties jsonb default '[]',
  rating numeric(3, 1) default 0,
  reviews integer default 0,
  verified boolean default false,
  is_published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.resources enable row level security;

-- The directory is a public marketing feature - anyone (including signed-out
-- visitors) can browse published resources.
create policy "resources_select_published"
  on public.resources for select
  using (is_published = true);

-- Fabricated placeholder listings (fake orgs, phone numbers, ratings) were
-- removed from here before this migration was ever applied to production --
-- confirmed the live `resources` table is empty. Real, verified African
-- support organizations should be seeded in their own migration instead of
-- invented examples.
