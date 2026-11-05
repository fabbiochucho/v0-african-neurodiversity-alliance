-- Admin panel phases (b)-(e): user management, refunds, feature switches, content,
-- support notes and tags, abuse review. Everything here is service role only except
-- published content, which visitors can read. Admin actions are recorded in
-- admin_audit_log (scripts/059).

-- (b) Suspension and soft deletion. A soft-deleted account is suspended at once and
-- purged by /api/cron/purge-accounts after delete_after, unless staff restore it.
create table if not exists public.account_admin_status (
  user_id uuid primary key references auth.users (id) on delete cascade,
  suspended_at timestamptz,
  suspended_reason text check (char_length(suspended_reason) <= 500),
  deleted_at timestamptz,
  delete_after timestamptz,
  deleted_reason text check (char_length(deleted_reason) <= 500),
  updated_by text not null,
  updated_at timestamptz not null default now()
);
create index if not exists account_admin_status_purge_idx on public.account_admin_status (delete_after) where deleted_at is not null;
alter table public.account_admin_status enable row level security;
revoke all on public.account_admin_status from anon, authenticated;

-- (e) Internal notes and tags on accounts. Never shown to the account holder.
create table if not exists public.account_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  author_email text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists account_notes_user_idx on public.account_notes (user_id, pinned desc, created_at desc);
alter table public.account_notes enable row level security;
revoke all on public.account_notes from anon, authenticated;

create table if not exists public.account_tags (
  user_id uuid not null references auth.users (id) on delete cascade,
  tag text not null check (tag ~ '^[a-z0-9][a-z0-9 -]{0,29}$'),
  added_by text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, tag)
);
create index if not exists account_tags_tag_idx on public.account_tags (tag);
alter table public.account_tags enable row level security;
revoke all on public.account_tags from anon, authenticated;

-- (c) Refunds, recorded on the transaction they refund.
alter table public.payment_transactions
  add column if not exists refunded_at timestamptz,
  add column if not exists refund_amount numeric(10, 2),
  add column if not exists refund_reference text,
  add column if not exists refunded_by text;

-- (d) Feature switches. A feature with no row is on. Order: kill switch, then the most
-- specific target (user, then organisation, then plan), then the global switch and the
-- percentage rollout (lib/features.ts).
create table if not exists public.feature_controls (
  key text primary key check (key ~ '^[a-z][a-z0-9_.]{1,59}$'),
  description text not null default '' check (char_length(description) <= 300),
  enabled boolean not null default true,
  killed boolean not null default false,
  rollout_percent integer not null default 100 check (rollout_percent between 0 and 100),
  updated_by text not null,
  updated_at timestamptz not null default now()
);
alter table public.feature_controls enable row level security;
revoke all on public.feature_controls from anon, authenticated;

create table if not exists public.feature_targets (
  id uuid primary key default gen_random_uuid(),
  feature_key text not null references public.feature_controls (key) on delete cascade,
  scope text not null check (scope in ('user', 'organization', 'plan')),
  scope_value text not null check (char_length(scope_value) between 1 and 100),
  enabled boolean not null,
  updated_by text not null,
  updated_at timestamptz not null default now(),
  unique (feature_key, scope, scope_value)
);
alter table public.feature_targets enable row level security;
revoke all on public.feature_targets from anon, authenticated;

-- (d) Blog posts, news, training and announcements written in the admin panel.
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('blog', 'news', 'training', 'announcement')),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  title text not null check (char_length(title) between 1 and 200),
  summary text not null default '' check (char_length(summary) <= 500),
  body text not null default '' check (char_length(body) <= 100000),
  cover_image_url text check (cover_image_url ~ '^https://'),
  external_url text check (external_url ~ '^https://'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  author_email text not null,
  updated_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists content_items_public_idx on public.content_items (kind, published_at desc) where status = 'published';
alter table public.content_items enable row level security;
revoke all on public.content_items from anon, authenticated;
grant select on public.content_items to anon, authenticated;
drop policy if exists content_items_public_read on public.content_items;
create policy content_items_public_read on public.content_items
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());

-- Public bucket for cover images; uploads go through the admin panel (service role) only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('content', 'content', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- (e) Abuse review queue, filled by /api/cron/abuse-scan. dedupe_key stops the same
-- signal being flagged twice.
create table if not exists public.abuse_flags (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('signup_burst_domain', 'repeated_failed_payments', 'post_burst')),
  user_id uuid references auth.users (id) on delete cascade,
  detail jsonb not null default '{}',
  dedupe_key text not null unique,
  status text not null default 'open' check (status in ('open', 'dismissed', 'actioned')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists abuse_flags_open_idx on public.abuse_flags (created_at desc) where status = 'open';
alter table public.abuse_flags enable row level security;
revoke all on public.abuse_flags from anon, authenticated;

-- (b) User search for /admin/users. Reads auth.users (last sign-in, confirmation), so it
-- runs as definer and only the service role may call it.
create extension if not exists pg_trgm with schema extensions;
create index if not exists profiles_email_trgm_idx on public.profiles using gin (lower(email) extensions.gin_trgm_ops);
create index if not exists profiles_name_trgm_idx
  on public.profiles using gin (lower(coalesce(first_name, '') || ' ' || coalesce(last_name, '')) extensions.gin_trgm_ops);

create or replace function public.admin_user_search(
  p_q text default null,
  p_status text default null,
  p_plan text default null,
  p_tag text default null,
  p_sort text default 'signed_up_desc',
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  signed_up_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz,
  plan text,
  suspended_at timestamptz,
  deleted_at timestamptz,
  tags text[],
  total bigint
)
language sql
stable
security definer
set search_path = public, auth, extensions
as $$
  with base as (
    select
      u.id as user_id,
      u.email::text as email,
      p.first_name,
      p.last_name,
      u.created_at as signed_up_at,
      u.last_sign_in_at,
      u.email_confirmed_at,
      coalesce(public.entitled_tier(u.id), 'free') as plan,
      st.suspended_at,
      st.deleted_at,
      coalesce((select array_agg(t.tag order by t.tag) from public.account_tags t where t.user_id = u.id), '{}') as tags
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.account_admin_status st on st.user_id = u.id
    where
      p_q is null or p_q = ''
      or u.id::text = p_q
      or lower(u.email) like '%' || lower(p_q) || '%'
      or lower(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')) like '%' || lower(p_q) || '%'
      or split_part(lower(u.email), '@', 2) = lower(p_q)
  ),
  filtered as (
    select * from base
    where (p_plan is null or p_plan = '' or plan = p_plan)
      and (p_tag is null or p_tag = '' or p_tag = any (tags))
      and (
        p_status is null or p_status = ''
        or (p_status = 'active' and suspended_at is null and deleted_at is null and email_confirmed_at is not null)
        or (p_status = 'unconfirmed' and email_confirmed_at is null and deleted_at is null)
        or (p_status = 'suspended' and suspended_at is not null and deleted_at is null)
        or (p_status = 'deleted' and deleted_at is not null)
      )
  )
  select f.*, count(*) over () as total
  from filtered f
  order by
    case when p_sort = 'signed_up_asc' then f.signed_up_at end asc,
    case when p_sort = 'last_active_desc' then f.last_sign_in_at end desc nulls last,
    case when p_sort = 'email_asc' then f.email end asc,
    f.signed_up_at desc
  limit least(greatest(p_limit, 1), 200)
  offset greatest(p_offset, 0);
$$;
revoke all on function public.admin_user_search(text, text, text, text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.admin_user_search(text, text, text, text, text, integer, integer) to service_role;

-- (b) Sign a user out everywhere: their refresh tokens go with their sessions.
create or replace function public.admin_revoke_sessions(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = auth, public
as $$
declare n integer;
begin
  delete from auth.sessions where user_id = p_user;
  get diagnostics n = row_count;
  return n;
end;
$$;
revoke all on function public.admin_revoke_sessions(uuid) from public, anon, authenticated;
grant execute on function public.admin_revoke_sessions(uuid) to service_role;
