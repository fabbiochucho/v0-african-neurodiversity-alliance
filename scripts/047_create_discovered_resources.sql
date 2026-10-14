-- Books and apps found automatically each week (lib/discover.ts via
-- app/api/cron/fetch-resources): books from Open Library published in the
-- last 10 years, apps from the App Store updated in the last 5 years.
--
-- Same pattern as news_items / research_feed (041): filled only by the
-- service role, published straight away, hidden by an admin at /admin/feeds.
-- Only titles, creators, links and short store descriptions are stored.

create table if not exists public.discovered_resources (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('book', 'app')),
  title text not null,
  creator text,
  url text not null unique,
  image_url text,
  source text not null,
  published_on date,
  price text,
  description text,
  is_hidden boolean not null default false,
  created_at timestamp with time zone not null default now()
);
create index if not exists discovered_resources_kind_idx on public.discovered_resources (kind, published_on desc);

alter table public.discovered_resources enable row level security;
create policy "discovered_resources_select_visible"
  on public.discovered_resources for select
  using (is_hidden = false);
