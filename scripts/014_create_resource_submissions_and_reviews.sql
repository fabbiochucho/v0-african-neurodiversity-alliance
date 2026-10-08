-- Powers the Find Support directory's "Add a Resource" / "Request Support in
-- Your Area" and per-resource rating features (app/directory/page.tsx).

-- Public submissions, held for manual review before becoming a real
-- `resources` row -- never auto-published, so the directory can't be
-- polluted with unverified/spam listings the way the old hardcoded fake
-- data misrepresented real orgs.
create table if not exists public.resource_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null default 'support_group', -- school | therapist | support_group | healthcare | caregiver
  country text,
  location text,
  contact_info jsonb default '{}', -- { phone?, email?, website? }
  specialties jsonb default '[]',
  submitted_by_email text, -- optional, so the team can follow up
  status text not null default 'pending', -- pending | approved | rejected
  created_at timestamp with time zone default now()
);

alter table public.resource_submissions enable row level security;

-- Anyone (including signed-out visitors) can submit a suggestion. Nobody can
-- read submissions back through the public API -- review happens via the
-- Supabase dashboard / service role, not a public admin UI (none exists yet).
create policy "resource_submissions_insert_anyone"
  on public.resource_submissions for insert
  with check (true);

-- Ratings/reviews on published resources.
create table if not exists public.resource_reviews (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  reviewer_name text,
  created_at timestamp with time zone default now()
);

alter table public.resource_reviews enable row level security;

create policy "resource_reviews_select_all"
  on public.resource_reviews for select
  using (true);

create policy "resource_reviews_insert_anyone"
  on public.resource_reviews for insert
  with check (true);

create index if not exists resource_reviews_resource_id_idx on public.resource_reviews (resource_id);

-- Keep resources.rating/reviews (already displayed by the directory UI) in
-- sync with real submitted reviews instead of the fabricated numbers the
-- old mock data used. SECURITY DEFINER so an anonymous reviewer -- who only
-- has INSERT on resource_reviews, not UPDATE on resources -- can still
-- trigger the aggregate refresh.
create or replace function public.update_resource_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.resources
  set rating = (select round(avg(rating)::numeric, 1) from public.resource_reviews where resource_id = new.resource_id),
      reviews = (select count(*) from public.resource_reviews where resource_id = new.resource_id),
      updated_at = now()
  where id = new.resource_id;
  return new;
end;
$$;

create trigger resource_review_update_rating
after insert on public.resource_reviews
for each row execute function public.update_resource_rating();
