-- Community replies and saved posts (2026-10-21). Replies are one level deep
-- (a reply belongs to a post). Private messages are deliberately not built:
-- unmoderated direct messages are too risky on a site about children.

create table if not exists public.community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamp with time zone not null default now()
);

alter table public.community_replies enable row level security;

-- Public forum, like the posts: anyone can read replies.
create policy community_replies_select_all on public.community_replies
  for select to anon, authenticated using (true);
create policy community_replies_insert_own on public.community_replies
  for insert to authenticated with check (user_id = auth.uid());
create policy community_replies_delete_own on public.community_replies
  for delete to authenticated using (user_id = auth.uid());

create index if not exists idx_community_replies_post on public.community_replies(post_id, created_at);

-- Saved posts are private to the person who saved them.
create table if not exists public.community_saved_posts (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  primary key (post_id, user_id)
);

alter table public.community_saved_posts enable row level security;

create policy community_saved_posts_select_own on public.community_saved_posts
  for select to authenticated using (user_id = auth.uid());
create policy community_saved_posts_insert_own on public.community_saved_posts
  for insert to authenticated with check (user_id = auth.uid());
create policy community_saved_posts_delete_own on public.community_saved_posts
  for delete to authenticated using (user_id = auth.uid());

-- Migration 049 stopped new tables being open to anon by default.
revoke all on public.community_replies, public.community_saved_posts from anon;
grant select on public.community_replies to anon;
grant select, insert, delete on public.community_replies, public.community_saved_posts to authenticated;
