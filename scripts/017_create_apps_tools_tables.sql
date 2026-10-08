-- Replaces the entirely-fabricated appCategories/featuredApps/assistiveTech
-- arrays previously hardcoded in app/apps-tools/page.tsx (fake per-category
-- app counts, invented download counts and star ratings) with a real,
-- DB-backed directory -- same pattern as public.resources for Find Support.

create table if not exists public.apps_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  developer text,
  description text,
  category text not null default 'learning', -- communication | learning | sensory | organization | social | wellness
  type text not null default 'app', -- app | assistive_tech
  platforms jsonb default '[]', -- ["iOS","Android","Web"]
  price text, -- free-form: "Free", "$9.99", "$50-$150", "Subscription", "Unknown"
  url text,
  country_origin text, -- nullable; set for African-made/African-origin entries
  features jsonb default '[]',
  rating numeric(3, 1) default 0,
  reviews integer default 0,
  verified boolean default false,
  is_published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.apps_tools enable row level security;

create policy "apps_tools_select_published"
  on public.apps_tools for select
  using (is_published = true);

-- Public submissions, held for manual review before becoming a real
-- apps_tools row -- never auto-published, same reasoning as
-- resource_submissions.
create table if not exists public.apps_tools_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  developer text,
  description text,
  category text not null default 'learning',
  type text not null default 'app',
  platforms jsonb default '[]',
  price text,
  url text,
  country_origin text,
  submitted_by_email text,
  status text not null default 'pending', -- pending | approved | rejected
  created_at timestamp with time zone default now()
);

alter table public.apps_tools_submissions enable row level security;

create policy "apps_tools_submissions_insert_anyone"
  on public.apps_tools_submissions for insert
  with check (true);

-- Ratings/reviews on published apps & tools.
create table if not exists public.apps_tools_reviews (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps_tools(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  reviewer_name text,
  created_at timestamp with time zone default now()
);

alter table public.apps_tools_reviews enable row level security;

create policy "apps_tools_reviews_select_all"
  on public.apps_tools_reviews for select
  using (true);

create policy "apps_tools_reviews_insert_anyone"
  on public.apps_tools_reviews for insert
  with check (true);

create index if not exists apps_tools_reviews_app_id_idx on public.apps_tools_reviews (app_id);

create or replace function public.update_apps_tools_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.apps_tools
  set rating = (select round(avg(rating)::numeric, 1) from public.apps_tools_reviews where app_id = new.app_id),
      reviews = (select count(*) from public.apps_tools_reviews where app_id = new.app_id),
      updated_at = now()
  where id = new.app_id;
  return new;
end;
$$;

create trigger apps_tools_review_update_rating
after insert on public.apps_tools_reviews
for each row execute function public.update_apps_tools_rating();
