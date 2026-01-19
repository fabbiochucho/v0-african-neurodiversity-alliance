-- Create organizations table for institutional users
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  organization_type text,
  subscription_tier text default 'free',
  max_users integer default 5,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.organizations enable row level security;

create policy "organizations_select_members"
  on public.organizations for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.organization_id = organizations.id
      and profiles.id = auth.uid()
    )
  );
