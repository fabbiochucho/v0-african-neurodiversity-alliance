-- Postgres does not automatically index foreign key columns (only the
-- referenced primary/unique key side gets one). Every RLS policy in this
-- app does an `exists (select 1 from <table> where <table>.<fk> = ... and
-- <table>.<owner_col> = auth.uid())` style check, so every one of these
-- columns is on the hot path of nearly every read/write. At current row
-- counts a sequential scan is invisible; it won't be once these tables have
-- real data.

create index if not exists idx_profiles_organization_id on public.profiles(organization_id);

create index if not exists idx_learner_profiles_user_id on public.learner_profiles(user_id);

create index if not exists idx_ieps_learner_id on public.ieps(learner_id);
create index if not exists idx_ieps_created_by on public.ieps(created_by);

create index if not exists idx_iep_goals_iep_id on public.iep_goals(iep_id);

create index if not exists idx_progress_logs_goal_id on public.progress_logs(goal_id);
create index if not exists idx_progress_logs_logged_by on public.progress_logs(logged_by);

create index if not exists idx_progress_summaries_learner_id on public.progress_summaries(learner_id);

create index if not exists idx_reports_learner_id on public.reports(learner_id);
create index if not exists idx_reports_generated_by on public.reports(generated_by);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);

create index if not exists idx_payment_transactions_subscription_id on public.payment_transactions(subscription_id);
