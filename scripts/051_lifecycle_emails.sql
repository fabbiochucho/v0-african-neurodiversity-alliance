-- Welcome and check-in reminder emails (2026-10-21). One row per person
-- once we first email them. The token is for the opt-out link.

create table if not exists public.email_lifecycle (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  welcome_sent_at timestamp with time zone,
  last_reminder_at timestamp with time zone,
  reminders_off_at timestamp with time zone
);

alter table public.email_lifecycle enable row level security;
create policy email_lifecycle_select_own on public.email_lifecycle
  for select to authenticated using (user_id = auth.uid());
revoke all on public.email_lifecycle from anon, authenticated;
grant select on public.email_lifecycle to authenticated;

-- Confirmed accounts from the last 7 days that haven't had a welcome email.
create or replace function public.lifecycle_welcome_due()
returns table (user_id uuid, email text, first_name text)
language sql stable security definer set search_path = public as $$
  select p.id, u.email::text, p.first_name
  from auth.users u
  join public.profiles p on p.id = u.id
  left join public.email_lifecycle l on l.user_id = p.id
  where u.email_confirmed_at is not null
    and u.created_at > now() - interval '7 days'
    and l.welcome_sent_at is null
  limit 500;
$$;

-- People with at least one learner who logged no progress in 7 days, haven't
-- had a reminder in 7 days and haven't turned reminders off.
create or replace function public.lifecycle_reminder_due()
returns table (user_id uuid, email text, first_name text)
language sql stable security definer set search_path = public as $$
  select p.id, u.email::text, p.first_name
  from auth.users u
  join public.profiles p on p.id = u.id
  left join public.email_lifecycle l on l.user_id = p.id
  where u.email_confirmed_at is not null
    and u.created_at < now() - interval '7 days'
    and exists (select 1 from public.learner_profiles lp where lp.user_id = p.id)
    and not exists (
      select 1 from public.progress_logs pl
      where pl.logged_by = p.id and pl.created_at > now() - interval '7 days'
    )
    and l.reminders_off_at is null
    and (l.last_reminder_at is null or l.last_reminder_at < now() - interval '7 days')
  limit 500;
$$;

revoke execute on function public.lifecycle_welcome_due(), public.lifecycle_reminder_due() from public, anon, authenticated;
grant execute on function public.lifecycle_welcome_due(), public.lifecycle_reminder_due() to service_role;
