-- Real community posting (audit item F.1 / master prompt Section C's
-- "Community" pivot to user-generated content). Previously app/community/page.tsx
-- had its "Start a Discussion"/"New Post" buttons disabled with no backend
-- at all. This gives it one: posting and liking are real; threaded replies
-- are a deliberate fast-follow (the "Reply" affordance stays disabled and
-- honest until that's built, rather than faking a reply count).
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  title text not null,
  body text not null,
  is_pinned boolean not null default false,
  created_at timestamp with time zone default now()
);

alter table public.community_posts enable row level security;

-- Public forum: anyone (including signed-out visitors) can read posts.
create policy "community_posts_select_all"
  on public.community_posts for select
  using (true);

-- Posting requires a real signed-in account, consistent with how the rest
-- of ANDA treats accountability (no anonymous posting, unlike the
-- lighter-weight resource/app submissions which are pre-moderated instead).
create policy "community_posts_insert_own"
  on public.community_posts for insert
  with check (user_id = auth.uid());

create table if not exists public.community_post_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (post_id, user_id)
);

alter table public.community_post_likes enable row level security;

create policy "community_post_likes_select_all"
  on public.community_post_likes for select
  using (true);

create policy "community_post_likes_insert_own"
  on public.community_post_likes for insert
  with check (user_id = auth.uid());

create policy "community_post_likes_delete_own"
  on public.community_post_likes for delete
  using (user_id = auth.uid());

create index if not exists idx_community_posts_category on public.community_posts(category);
create index if not exists idx_community_posts_created_at on public.community_posts(created_at desc);
create index if not exists idx_community_post_likes_post on public.community_post_likes(post_id);
