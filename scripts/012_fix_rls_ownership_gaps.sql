-- Tightens RLS policies that checked the wrong thing (or nothing) for the
-- row being written/read, letting one user's writes attach to another
-- user's records, or letting org-scoped reads leak across organizations.

-- learner_profiles_select_own: the org clause matched "caller belongs to
-- *any* organization" instead of "caller belongs to the *same*
-- organization as the learner's owner", so any org member could read every
-- learner_profiles row in the database.
drop policy if exists "learner_profiles_select_own" on public.learner_profiles;

create policy "learner_profiles_select_own"
  on public.learner_profiles for select
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.profiles caller
      join public.profiles owner on owner.id = learner_profiles.user_id
      where caller.id = auth.uid()
      and caller.organization_id is not null
      and caller.organization_id = owner.organization_id
    )
  );

-- learner_profiles_insert_own: only checked that a profiles row exists for
-- the caller, never that the new row's user_id is the caller's own id, so
-- a user could insert a learner_profiles row attributed to someone else.
drop policy if exists "learner_profiles_insert_own" on public.learner_profiles;

create policy "learner_profiles_insert_own"
  on public.learner_profiles for insert
  with check (user_id = auth.uid());

-- ieps_insert_own: only checked created_by = auth.uid(), never that
-- learner_id belongs to the caller, so a user could attach an IEP to
-- another user's learner profile.
drop policy if exists "ieps_insert_own" on public.ieps;

create policy "ieps_insert_own"
  on public.ieps for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = ieps.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );

-- progress_logs_insert_via_goal: only checked logged_by = auth.uid(), never
-- that goal_id belongs to an IEP the caller owns, so a user could log
-- progress against another user's goal.
drop policy if exists "progress_logs_insert_via_goal" on public.progress_logs;

create policy "progress_logs_insert_via_goal"
  on public.progress_logs for insert
  with check (
    logged_by = auth.uid()
    and exists (
      select 1 from public.iep_goals
      join public.ieps on ieps.id = iep_goals.iep_id
      where iep_goals.id = progress_logs.goal_id
      and ieps.created_by = auth.uid()
    )
  );

-- reports_insert_own: only checked generated_by = auth.uid(), never that
-- learner_id belongs to the caller, so a user could attach a report to
-- another user's learner profile.
drop policy if exists "reports_insert_own" on public.reports;

create policy "reports_insert_own"
  on public.reports for insert
  with check (
    generated_by = auth.uid()
    and exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = reports.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );

-- subscriptions_update_own: no app code updates subscriptions with the
-- user-scoped client (webhook/verify write with the service-role client,
-- which bypasses RLS) — this policy only let a user self-edit their own
-- tier/status/amount_paid via a direct anon-key call. Nothing legitimate
-- needs it, so remove it rather than patch it.
drop policy if exists "subscriptions_update_own" on public.subscriptions;
