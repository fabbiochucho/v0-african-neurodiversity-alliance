-- News, open-access research feed, weekly digest subscribers, and partners.
--
-- news_items and research_feed are filled by the daily cron
-- (app/api/cron/fetch-feeds) using the service role. Items publish straight
-- away; an admin hides off-topic ones at /admin/feeds. Only titles, sources
-- and links are stored -- never article or paper text.
--
-- Numbered 041 to stay clear of 028-035 in the open audit PRs.

create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null unique,
  source text,           -- outlet domain, or "allAfrica"
  country text,
  published_at timestamp with time zone,
  is_hidden boolean not null default false,
  created_at timestamp with time zone not null default now()
);
create index if not exists news_items_published_idx on public.news_items (published_at desc);

alter table public.news_items enable row level security;
create policy "news_items_select_visible"
  on public.news_items for select
  using (is_hidden = false);

create table if not exists public.research_feed (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null unique,
  authors text,
  journal text,
  published_on date,
  scope text not null check (scope in ('africa', 'global')), -- africa = African-affiliated authors; global = reviews + topic trials
  topics text[] not null default '{}', -- lib/feeds.ts TOPICS, matched on the title
  is_hidden boolean not null default false,
  created_at timestamp with time zone not null default now()
);
create index if not exists research_feed_published_idx on public.research_feed (published_on desc);
create index if not exists research_feed_topics_idx on public.research_feed using gin (topics);

alter table public.research_feed enable row level security;
create policy "research_feed_select_visible"
  on public.research_feed for select
  using (is_hidden = false);

-- Double opt-in: a row is created unconfirmed, and only confirmed rows get
-- the digest. No RLS policies at all: only the service role (API routes)
-- touches this table, so addresses are never readable from the browser.
create table if not exists public.digest_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  token uuid not null default gen_random_uuid(),
  confirmed_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);
alter table public.digest_subscribers enable row level security;

-- Organisations that actually back ANDA. Added by hand (Supabase dashboard)
-- once support is confirmed; nothing shows on the site until a row is
-- published.
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  logo_url text,
  kind text,             -- e.g. Funder, Partner, Sponsor
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamp with time zone not null default now()
);
alter table public.partners enable row level security;
create policy "partners_select_published"
  on public.partners for select
  using (is_published = true);
