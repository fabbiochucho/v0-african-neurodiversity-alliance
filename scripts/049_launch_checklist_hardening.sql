-- Launch-checklist hardening (2026-10-17).

-- 1. Signed-out visitors never need these tables. RLS already shows them
--    nothing (checked on prod 2026-10-17); now the grant says so too, so a
--    future policy mistake can't expose them to the anon key.
revoke all on table
  ai_companion_usage, ai_learner_consent_events, audit_log, branding_settings,
  digest_subscribers, iep_goals, iep_plan_items, iep_plan_versions, ieps,
  learner_profiles, learner_records, linked_accounts, payment_transactions,
  progress_logs, progress_summaries, reports, screenings, subscriptions,
  support_team_members, user_preferences
from anon;

-- New tables are no longer open to anon by default: grant public content
-- tables to anon explicitly in their own migration.
alter default privileges in schema public revoke all on tables from anon;

-- 2. These SECURITY DEFINER helpers take any user id (entitled_tier,
--    has_permission, ...) or act for the caller. Only signed-in users need them.
do $$
declare f regprocedure;
begin
  for f in
    select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in (
      'entitled_tier', 'tier_allows', 'has_permission', 'is_support_member',
      'accept_support_team_invite', 'refresh_support_team_invite',
      'set_member_permissions', 'approve_plan_items')
  loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated, service_role', f);
  end loop;
end $$;

-- 3. Ratings: nothing in the app reads review rows (the rating triggers do,
--    as SECURITY DEFINER), so stop publishing them, and bound what can be
--    written.
drop policy if exists apps_tools_reviews_select_all on apps_tools_reviews;
drop policy if exists resource_reviews_select_all on resource_reviews;
drop policy if exists learning_resource_reviews_select_all on learning_resource_reviews;
alter table apps_tools_reviews
  add constraint apps_tools_reviews_bounds check (rating between 1 and 5 and char_length(coalesce(comment, '')) <= 1000);
alter table resource_reviews
  add constraint resource_reviews_bounds check (rating between 1 and 5 and char_length(coalesce(comment, '')) <= 1000);
alter table learning_resource_reviews
  add constraint learning_resource_reviews_bounds check (rating between 1 and 5 and char_length(coalesce(comment, '')) <= 1000);

-- 4. Community: authors can delete their own posts.
create policy community_posts_delete_own on community_posts
  for delete to authenticated using (user_id = auth.uid());
alter table community_posts
  add constraint community_posts_bounds check (char_length(title) <= 200 and char_length(body) <= 5000);
