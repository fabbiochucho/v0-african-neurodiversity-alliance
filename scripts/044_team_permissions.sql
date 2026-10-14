-- Round 3, PR H, brief §20: per-member permissions replace role-only access.
-- Depends on 031, 032 (tier_allows), 034, 042 (learner_records).
--
-- Permissions: view, comment, add_observation, log_progress, suggest_goal,
--              approve, manage_plan, invite, export, generate_report.
-- Roles become presets (lib/team-permissions.ts) that pre-fill the list.
-- For learners under 18 (or with no age recorded) only the learner's owner
-- (the parent/guardian) can grant approve, manage_plan, invite or export.
-- Member access still requires the owner's plan to include support teams
-- (034's lapse rule), now inside has_permission().

alter table public.support_team_members
  add column if not exists permissions text[] not null default '{}';

alter table public.support_team_members drop constraint if exists support_team_members_role_check;
alter table public.support_team_members add constraint support_team_members_role_check
  check (role in ('caregiver', 'teacher', 'therapist', 'parent', 'guardian', 'school_admin', 'clinician', 'specialist', 'other_professional'));

alter table public.support_team_members drop constraint if exists support_team_members_permissions_check;
alter table public.support_team_members add constraint support_team_members_permissions_check
  check (permissions <@ array['view', 'comment', 'add_observation', 'log_progress', 'suggest_goal', 'approve', 'manage_plan', 'invite', 'export', 'generate_report']);

-- Existing rows keep exactly what their role allowed under 031.
update public.support_team_members set permissions = case role
  when 'caregiver' then array['view', 'comment', 'add_observation', 'log_progress', 'generate_report']
  when 'teacher' then array['view', 'comment', 'add_observation', 'log_progress']
  when 'therapist' then array['view', 'comment', 'add_observation', 'log_progress', 'generate_report', 'manage_plan']
  else permissions end
where permissions = '{}';

-- ---- The one permission check every policy uses -------------------------------
create or replace function public.has_permission(p_learner_id uuid, p_perm text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.learner_profiles l
    where l.id = p_learner_id and l.user_id = auth.uid()
  )
  or exists (
    select 1 from public.support_team_members m
    where m.learner_id = p_learner_id
      and m.member_user_id = auth.uid()
      and m.status = 'active'
      and p_perm = any (m.permissions)
      and public.tier_allows(m.owner_id, 'pro')
  );
$$;

revoke all on function public.has_permission(uuid, text) from public;
grant execute on function public.has_permission(uuid, text) to authenticated;

-- Keep the old helper working for anything still calling it, now expressed
-- through permissions (roles argument ignored except 'therapist' legacy).
create or replace function public.is_support_member(p_learner_id uuid, p_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_permission(p_learner_id, 'view');
$$;

-- ---- Minors: sensitive permissions only from the owner -----------------------
create or replace function public.support_team_guard_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  learner_owner uuid;
  learner_age integer;
begin
  select user_id, age into learner_owner, learner_age from public.learner_profiles where id = new.learner_id;

  if new.permissions && array['approve', 'manage_plan', 'invite', 'export']
    and (learner_age is null or learner_age < 18)
    and auth.uid() is distinct from learner_owner
    and coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') <> 'service_role'
  then
    raise exception 'For learners under 18, only their parent or guardian can grant approve, manage plan, invite or export.';
  end if;

  if tg_op = 'UPDATE' and new.permissions is distinct from old.permissions
    and auth.uid() is distinct from learner_owner
    and coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') <> 'service_role'
  then
    raise exception 'Only the learner''s owner can change permissions.';
  end if;

  return new;
end;
$$;

drop trigger if exists support_team_guard_permissions on public.support_team_members;
create trigger support_team_guard_permissions
  before insert or update on public.support_team_members
  for each row execute function public.support_team_guard_permissions();

-- Invites: the owner, or a member holding 'invite', can invite. owner_id
-- always names the learner's owner (whose plan must be Pro+).
drop policy if exists "support_team_insert_owner" on public.support_team_members;
create policy "support_team_insert_owner"
  on public.support_team_members for insert
  with check (
    status = 'pending'
    and member_user_id is null
    and accepted_at is null
    and (invite_expires_at is null or invite_expires_at <= now() + interval '14 days')
    and owner_id = (select user_id from public.learner_profiles where id = support_team_members.learner_id)
    and public.tier_allows(owner_id, 'pro') -- gate:support_team
    and public.has_permission(learner_id, 'invite')
  );

-- Owner changes a member's preset and permissions (no UPDATE policy on the
-- table; the trigger above re-checks the minors rule).
create or replace function public.set_member_permissions(member_id uuid, new_role text, new_permissions text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_team_members m
  set role = new_role, permissions = new_permissions
  where m.id = member_id
    and exists (select 1 from public.learner_profiles l where l.id = m.learner_id and l.user_id = auth.uid());
  if not found then
    raise exception 'member not found';
  end if;
end;
$$;

revoke all on function public.set_member_permissions(uuid, text, text[]) from public;
grant execute on function public.set_member_permissions(uuid, text, text[]) to authenticated;

-- ---- Policies, re-expressed through has_permission ---------------------------
drop policy if exists "learner_profiles_select_support_team" on public.learner_profiles;
create policy "learner_profiles_select_support_team" on public.learner_profiles for select
  using (public.has_permission(id, 'view'));

drop policy if exists "ieps_select_support_team" on public.ieps;
create policy "ieps_select_support_team" on public.ieps for select
  using (public.has_permission(learner_id, 'view'));

drop policy if exists "iep_goals_select_support_team" on public.iep_goals;
create policy "iep_goals_select_support_team" on public.iep_goals for select
  using (exists (select 1 from public.ieps where ieps.id = iep_goals.iep_id and public.has_permission(ieps.learner_id, 'view')));

drop policy if exists "progress_logs_select_support_team" on public.progress_logs;
create policy "progress_logs_select_support_team" on public.progress_logs for select
  using (exists (
    select 1 from public.iep_goals join public.ieps on ieps.id = iep_goals.iep_id
    where iep_goals.id = progress_logs.goal_id and public.has_permission(ieps.learner_id, 'view')
  ));

drop policy if exists "progress_summaries_select_support_team" on public.progress_summaries;
create policy "progress_summaries_select_support_team" on public.progress_summaries for select
  using (public.has_permission(learner_id, 'view'));

drop policy if exists "reports_select_support_team" on public.reports;
create policy "reports_select_support_team" on public.reports for select
  using (public.has_permission(learner_id, 'generate_report'));

drop policy if exists "progress_logs_insert_support_team" on public.progress_logs;
create policy "progress_logs_insert_support_team" on public.progress_logs for insert
  with check (
    logged_by = auth.uid()
    and exists (
      select 1 from public.iep_goals join public.ieps on ieps.id = iep_goals.iep_id
      where iep_goals.id = progress_logs.goal_id and public.has_permission(ieps.learner_id, 'log_progress')
    )
  );

drop policy if exists "iep_goals_update_support_therapist" on public.iep_goals;
create policy "iep_goals_update_support_team" on public.iep_goals for update
  using (exists (
    select 1 from public.ieps where ieps.id = iep_goals.iep_id
    and (public.has_permission(ieps.learner_id, 'manage_plan') or public.has_permission(ieps.learner_id, 'approve'))
  ))
  with check (exists (
    select 1 from public.ieps where ieps.id = iep_goals.iep_id
    and (public.has_permission(ieps.learner_id, 'manage_plan') or public.has_permission(ieps.learner_id, 'approve'))
  ));

-- Learner records: members with 'view' read them; 'add_observation' adds
-- observations (never professional input or server-only kinds).
create policy "learner_records_select_team" on public.learner_records for select
  using (public.has_permission(learner_id, 'view'));

create policy "learner_records_insert_team_observation" on public.learner_records for insert
  with check (
    created_by = auth.uid()
    and kind = 'observation'
    and record_type = 'support_profile'
    and file_path is null
    and public.has_permission(learner_id, 'add_observation')
  );
