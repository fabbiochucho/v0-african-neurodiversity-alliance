-- Supabase Data API Security Grants Migration
-- Required by Supabase from May 30, 2026
-- Adds explicit GRANT statements for anon, authenticated, and service_role
-- Reference: https://supabase.com/blog/data-api-supabase-managed-postgres

-- ============================================================================
-- PROFILES TABLE GRANTS
-- ============================================================================
grant select on public.profiles to anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

-- ============================================================================
-- ORGANIZATIONS TABLE GRANTS
-- ============================================================================
grant select on public.organizations to anon;
grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.organizations to service_role;

-- ============================================================================
-- LEARNER PROFILES TABLE GRANTS
-- ============================================================================
grant select on public.learner_profiles to anon;
grant select, insert, update, delete on public.learner_profiles to authenticated;
grant select, insert, update, delete on public.learner_profiles to service_role;

-- ============================================================================
-- IEP TABLES GRANTS
-- ============================================================================
grant select on public.ieps to anon;
grant select, insert, update, delete on public.ieps to authenticated;
grant select, insert, update, delete on public.ieps to service_role;

grant select on public.iep_goals to anon;
grant select, insert, update, delete on public.iep_goals to authenticated;
grant select, insert, update, delete on public.iep_goals to service_role;

-- ============================================================================
-- PROGRESS TABLES GRANTS
-- ============================================================================
grant select on public.progress_logs to anon;
grant select, insert, update, delete on public.progress_logs to authenticated;
grant select, insert, update, delete on public.progress_logs to service_role;

grant select on public.progress_summaries to anon;
grant select, insert, update, delete on public.progress_summaries to authenticated;
grant select, insert, update, delete on public.progress_summaries to service_role;

-- ============================================================================
-- REPORTS TABLE GRANTS
-- ============================================================================
grant select on public.reports to anon;
grant select, insert, update, delete on public.reports to authenticated;
grant select, insert, update, delete on public.reports to service_role;

-- ============================================================================
-- PAYMENTS TABLE GRANTS
-- ============================================================================
grant select on public.subscriptions to anon;
grant select, insert, update, delete on public.subscriptions to authenticated;
grant select, insert, update, delete on public.subscriptions to service_role;

grant select on public.payment_transactions to anon;
grant select, insert, update, delete on public.payment_transactions to authenticated;
grant select, insert, update, delete on public.payment_transactions to service_role;

-- ============================================================================
-- FORUM TABLES GRANTS
-- ============================================================================
grant select on public.forum_categories to anon;
grant select, insert, update, delete on public.forum_categories to authenticated;
grant select, insert, update, delete on public.forum_categories to service_role;

grant select on public.forum_threads to anon;
grant select, insert, update, delete on public.forum_threads to authenticated;
grant select, insert, update, delete on public.forum_threads to service_role;

grant select on public.forum_posts to anon;
grant select, insert, update, delete on public.forum_posts to authenticated;
grant select, insert, update, delete on public.forum_posts to service_role;

grant select on public.forum_post_likes to anon;
grant select, insert, update, delete on public.forum_post_likes to authenticated;
grant select, insert, update, delete on public.forum_post_likes to service_role;

grant select on public.forum_moderation to anon;
grant select, insert, update, delete on public.forum_moderation to authenticated;
grant select, insert, update, delete on public.forum_moderation to service_role;

-- ============================================================================
-- RESOURCES TABLES GRANTS
-- ============================================================================
grant select on public.resource_categories to anon;
grant select, insert, update, delete on public.resource_categories to authenticated;
grant select, insert, update, delete on public.resource_categories to service_role;

grant select on public.resources to anon;
grant select, insert, update, delete on public.resources to authenticated;
grant select, insert, update, delete on public.resources to service_role;

grant select on public.resource_reviews to anon;
grant select, insert, update, delete on public.resource_reviews to authenticated;
grant select, insert, update, delete on public.resource_reviews to service_role;

grant select on public.resource_favorites to anon;
grant select, insert, update, delete on public.resource_favorites to authenticated;
grant select, insert, update, delete on public.resource_favorites to service_role;

-- ============================================================================
-- ASSESSMENT TABLES GRANTS
-- ============================================================================
grant select on public.assessment_questions to anon;
grant select, insert, update, delete on public.assessment_questions to authenticated;
grant select, insert, update, delete on public.assessment_questions to service_role;

grant select on public.assessment_options to anon;
grant select, insert, update, delete on public.assessment_options to authenticated;
grant select, insert, update, delete on public.assessment_options to service_role;

grant select on public.assessments to anon;
grant select, insert, update, delete on public.assessments to authenticated;
grant select, insert, update, delete on public.assessments to service_role;

grant select on public.assessment_responses to anon;
grant select, insert, update, delete on public.assessment_responses to authenticated;
grant select, insert, update, delete on public.assessment_responses to service_role;

grant select on public.domain_scores to anon;
grant select, insert, update, delete on public.domain_scores to authenticated;
grant select, insert, update, delete on public.domain_scores to service_role;

-- ============================================================================
-- COMPLETION VERIFICATION
-- ============================================================================
-- All public tables now have explicit GRANT statements
-- All tables have RLS enabled with appropriate policies
-- Ready for Supabase Data API enforcement from May 30, 2026
