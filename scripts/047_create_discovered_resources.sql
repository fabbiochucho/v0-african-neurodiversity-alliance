-- Books, children's story books and apps found automatically each week
-- (lib/discover.ts via app/api/cron/fetch-resources): books and story books
-- from Open Library published in the last 10 years, apps from the App Store
-- updated in the last 5 years. Cartoons and animations ('video') have no free
-- automatic source, so they're a hand-checked list seeded below; admins can
-- add more rows in the table editor.
--
-- Same pattern as news_items / research_feed (041): filled only by the
-- service role, published straight away, hidden by an admin at /admin/feeds.
-- Only titles, creators, links and short store descriptions are stored.

create table if not exists public.discovered_resources (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('book', 'story', 'app', 'video')),
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

-- Hand-checked cartoons and animations (October 2026). Each link was confirmed
-- to exist; dates only where a source states them.
insert into public.discovered_resources (kind, title, creator, url, source, published_on, description)
select * from (values
  ('video', 'Carl the Collector', 'PBS Kids',
   'https://www.pbs.org/about/about-pbs/blogs/news/pbs-kids-announces-carl-the-collector-its-first-series-centering-on-autistic-characters/',
   'ANDA curated', date '2024-11-14',
   'Animated series for ages 4 to 8, led by an autistic raccoon, made with autistic consultants. PBS Kids'' first series centred on autistic characters.'),
  ('video', 'Pablo', 'Paper Owl Films for CBeebies',
   'https://en.wikipedia.org/wiki/Pablo_(TV_series)',
   'ANDA curated', date '2017-10-01',
   'Animated series about Pablo, a young autistic boy, and the Book Animals in his Art World. The first TV series with an all-autistic core cast.'),
  ('video', 'Thomas & Friends: Bruno the Brake Car', 'Thomas & Friends',
   'https://www.pbs.org/newshour/amp/show/thomas-and-friends-introduces-bruno-the-brake-car-its-first-character-with-autism',
   'ANDA curated', null::date,
   'Thomas & Friends introduces Bruno, its first character with autism.'),
  ('video', 'Autistic cartoon characters: Loop, Julia, Hero Elementary and more', 'Autism BC',
   'https://www.autismbc.ca/blog/autistic-cartoon-characters-6-canonical-examples-of-autism-representation-in-animation/',
   'ANDA curated', null::date,
   'A guide to animated shows and shorts with confirmed autistic characters, including Pixar''s Loop and Sesame Street''s Julia.'),
  ('video', 'Animated videos: young people talking about neurodiversity', 'ADHD Foundation',
   'https://www.adhdfoundation.org.uk/qr-2025-march-teenage-booklet-adhd-and-knowing-your-neurotype-video/',
   'ANDA curated', null::date,
   'Short animations for teenagers about ADHD, neurodiversity and knowing your neurotype.'),
  ('video', 'Animated introductions to autism, ADHD and neurodiversity', 'Stimpunks Foundation',
   'https://stimpunks.org/2025/12/21/animated-introductions-to-autism-adhd-and-neurodiversity/',
   'ANDA curated', date '2025-12-21',
   'A playlist of short, plain-language animated explainers, best for older children and adults.'),
  ('video', 'Videos and visuals for explaining neurodivergence', 'Explaining Brains',
   'https://explainingbrains.com/?p=7258',
   'ANDA curated', null::date,
   'A regularly updated list of videos for explaining ADHD, autism and dyslexia to children.')
) as v(kind, title, creator, url, source, published_on, description)
on conflict (url) do nothing;
