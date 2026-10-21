-- Admin dashboard numbers (2026-10-21): counts only, no personal data.
-- Read by app/admin/page.tsx with the service role.
create or replace function public.admin_stats()
returns jsonb
language sql stable security definer set search_path = public as $$
  with
    users as (select p.id, p.created_at, u.email_confirmed_at from public.profiles p join auth.users u on u.id = p.id),
    with_learner as (select distinct user_id from public.learner_profiles),
    with_goal as (
      select distinct lp.user_id
      from public.iep_goals g join public.ieps i on i.id = g.iep_id join public.learner_profiles lp on lp.id = i.learner_id
    ),
    with_checkin as (select distinct logged_by as user_id from public.progress_logs),
    paid as (
      select s.user_id, (array_agg(s.tier order by public.tier_rank(s.tier) desc))[1] as tier
      from public.subscriptions s
      where s.status = 'active' and s.renewal_date > now() and s.tier in ('premium', 'pro', 'institutional')
        and exists (select 1 from public.payment_transactions t where t.subscription_id = s.id and t.status = 'successful')
      group by s.user_id
    )
  select jsonb_build_object(
    'users', (select count(*) from users),
    'confirmed', (select count(*) from users where email_confirmed_at is not null),
    'new_7d', (select count(*) from users where created_at > now() - interval '7 days'),
    'new_30d', (select count(*) from users where created_at > now() - interval '30 days'),
    'funnel', jsonb_build_object(
      'signed_up', (select count(*) from users),
      'confirmed', (select count(*) from users where email_confirmed_at is not null),
      'added_learner', (select count(*) from with_learner),
      'set_goal', (select count(*) from with_goal),
      'logged_checkin', (select count(*) from with_checkin),
      'paid', (select count(*) from paid)
    ),
    'active_7d', (select count(distinct logged_by) from public.progress_logs where created_at > now() - interval '7 days'),
    'plans', coalesce((select jsonb_object_agg(tier, n) from (select tier, count(*) n from paid group by tier) t), '{}'::jsonb),
    'weekly_signups', coalesce((
      select jsonb_agg(jsonb_build_object('week', w, 'n', n) order by w)
      from (
        select date_trunc('week', created_at)::date as w, count(*) n
        from users where created_at > now() - interval '12 weeks' group by 1
      ) x
    ), '[]'::jsonb),
    'community_posts', (select count(*) from public.community_posts),
    'digest_subscribers', (select count(*) from public.digest_subscribers where confirmed_at is not null)
  );
$$;

revoke execute on function public.admin_stats() from public, anon, authenticated;
grant execute on function public.admin_stats() to service_role;
