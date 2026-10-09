-- Replaces the fabricated courses/certifications/webinars previously
-- hardcoded in app/learning/page.tsx (invented instructors, student counts,
-- prices for courses that didn't exist -- confirmed live with real dollar
-- prices and zero backend behind "Enroll"). Reframed honestly: this is a
-- curated directory of REAL external learning resources (ANDA doesn't host
-- its own LMS), same pattern as public.resources and public.apps_tools.
create table if not exists public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  provider text,
  description text,
  format text not null default 'course', -- course | certification | webinar | training
  price text, -- free-form: "Free", "$29", "Unknown"
  platform text, -- e.g. "Coursera", "provider's own site"
  url text,
  country_origin text, -- nullable; set for African-origin entries
  rating numeric(3, 1) default 0,
  reviews integer default 0,
  verified boolean default false,
  is_published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.learning_resources enable row level security;

create policy "learning_resources_select_published"
  on public.learning_resources for select
  using (is_published = true);

create table if not exists public.learning_resource_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  provider text,
  description text,
  format text not null default 'course',
  price text,
  platform text,
  url text,
  country_origin text,
  submitted_by_email text,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

alter table public.learning_resource_submissions enable row level security;

create policy "learning_resource_submissions_insert_anyone"
  on public.learning_resource_submissions for insert
  with check (true);

create table if not exists public.learning_resource_reviews (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.learning_resources(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  reviewer_name text,
  created_at timestamp with time zone default now()
);

alter table public.learning_resource_reviews enable row level security;

create policy "learning_resource_reviews_select_all"
  on public.learning_resource_reviews for select
  using (true);

create policy "learning_resource_reviews_insert_anyone"
  on public.learning_resource_reviews for insert
  with check (true);

create index if not exists learning_resource_reviews_resource_id_idx on public.learning_resource_reviews (resource_id);

create or replace function public.update_learning_resource_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.learning_resources
  set rating = (select round(avg(rating)::numeric, 1) from public.learning_resource_reviews where resource_id = new.resource_id),
      reviews = (select count(*) from public.learning_resource_reviews where resource_id = new.resource_id),
      updated_at = now()
  where id = new.resource_id;
  return new;
end;
$$;

create trigger learning_resource_review_update_rating
after insert on public.learning_resource_reviews
for each row execute function public.update_learning_resource_rating();
