-- Admin panel, phase (a): staff roles and an append-only audit log of admin actions.
-- Permissions per role live in lib/admin/permissions.ts; the database stores only the role.
-- People listed in ADMIN_EMAILS are treated as super admins even without a row here, so the
-- panel can't lock its owners out. Both tables are service role only.

create table if not exists public.staff_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null check (email = lower(email)),
  role text not null check (role in ('super_admin', 'support', 'finance', 'engineering', 'read_only')),
  added_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.staff_members enable row level security;
revoke all on public.staff_members from anon, authenticated;

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_email text not null,
  action text not null check (char_length(action) between 3 and 80),
  target_type text,
  target_id text,
  before jsonb,
  after jsonb,
  ip text,
  user_agent text check (char_length(user_agent) <= 500),
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_actor_idx on public.admin_audit_log (actor_email, created_at desc);
create index if not exists admin_audit_log_action_idx on public.admin_audit_log (action, created_at desc);
create index if not exists admin_audit_log_target_idx on public.admin_audit_log (target_type, target_id, created_at desc);
alter table public.admin_audit_log enable row level security;

-- Append-only: inserts and reads only, for every API role including the service role.
revoke all on public.admin_audit_log from anon, authenticated;
revoke update, delete, truncate on public.admin_audit_log from service_role;
grant select, insert on public.admin_audit_log to service_role;

create or replace function public.admin_audit_log_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception 'admin_audit_log is append-only';
end;
$$;
drop trigger if exists admin_audit_log_no_change on public.admin_audit_log;
create trigger admin_audit_log_no_change
  before update or delete on public.admin_audit_log
  for each row execute function public.admin_audit_log_append_only();
drop trigger if exists admin_audit_log_no_truncate on public.admin_audit_log;
create trigger admin_audit_log_no_truncate
  before truncate on public.admin_audit_log
  for each statement execute function public.admin_audit_log_append_only();
