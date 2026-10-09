-- Replaces entirely-fabricated research content previously hardcoded in
-- app/research/page.tsx (invented authors, institutions, journals, DOIs,
-- citation counts, funding amounts). Real papers + real active research
-- initiatives only. No star-rating here (unlike resources/apps_tools/
-- learning_resources) -- rating a published paper's "usefulness" isn't a
-- meaningful community signal the way rating an org or app is; community
-- contribution here is limited to submitting papers for review.
create table if not exists public.research_papers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors text,
  journal text,
  year integer,
  summary text,
  url text,
  country_focus text,
  verified boolean default false,
  is_published boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.research_papers enable row level security;

create policy "research_papers_select_published"
  on public.research_papers for select
  using (is_published = true);

create table if not exists public.research_initiatives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  institution text,
  description text,
  url text,
  verified boolean default false,
  is_published boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.research_initiatives enable row level security;

create policy "research_initiatives_select_published"
  on public.research_initiatives for select
  using (is_published = true);

create table if not exists public.research_paper_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors text,
  journal text,
  year integer,
  summary text,
  url text,
  submitted_by_email text,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

alter table public.research_paper_submissions enable row level security;

create policy "research_paper_submissions_insert_anyone"
  on public.research_paper_submissions for insert
  with check (true);
