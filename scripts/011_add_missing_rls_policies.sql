-- Fixes four tables whose RLS policies didn't cover the write paths their
-- API routes actually use: the missing policy makes the write a silent
-- (or loud) no-op instead of a permission error, since RLS just filters the
-- affected row set rather than raising.

-- iep_goals: PUT/DELETE /api/iep/goals/[goalId] update/delete by id with no
-- ownership check in application code (they rely on RLS), same owner rule
-- as iep_goals_insert_via_iep.
create policy "iep_goals_update_via_iep"
  on public.iep_goals for update
  using (
    exists (
      select 1 from public.ieps
      where ieps.id = iep_goals.iep_id
      and ieps.created_by = auth.uid()
    )
  );

create policy "iep_goals_delete_via_iep"
  on public.iep_goals for delete
  using (
    exists (
      select 1 from public.ieps
      where ieps.id = iep_goals.iep_id
      and ieps.created_by = auth.uid()
    )
  );

-- ieps: DELETE /api/iep/[id] deletes by id + created_by, same owner rule as
-- ieps_update_own.
create policy "ieps_delete_own"
  on public.ieps for delete
  using (created_by = auth.uid());

-- progress_summaries: POST /api/progress/summary/[learnerId] inserts a new
-- summary row, same owner rule as progress_summaries_select_own.
create policy "progress_summaries_insert_own"
  on public.progress_summaries for insert
  with check (
    exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = progress_summaries.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );

-- reports: /api/reports/send-email updates email_sent/email_sent_at after
-- sending, same owner rule as reports_select_own.
create policy "reports_update_own"
  on public.reports for update
  using (
    exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = reports.learner_id
      and learner_profiles.user_id = auth.uid()
    ) or generated_by = auth.uid()
  );
