-- Support Team (audit item F.7): a learner's owner can invite caregivers,
-- teachers and therapists, who then get role-scoped access to that one
-- person's IEP data.
--
-- What each role can do (on top of the owner, whose access is unchanged):
--   all roles   view the learner, their IEPs, goals, check-ins, snapshots;
--               log check-ins (progress_logs) against their goals
--   caregiver,  also view reports
--   therapist
--   therapist   also change a goal's status (e.g. mark achieved) -- and
--               nothing else on the goal (enforced by trigger, below)
--
-- Tightness rules followed here:
--   * no UPDATE policy on support_team_members at all. Invites are created
--     'pending' by the owner, accepted only through the security-definer
--     function accept_support_team_invite() (which checks the caller's
--     verified email), and removed by the owner with DELETE.
--   * the one new UPDATE policy (therapists on iep_goals) is column-limited
--     by a trigger, following scripts/022's pattern.

create table if not exists public.support_team_members (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  -- Shown to the invitee before they can see the learner's record.
  learner_name text not null,
  invited_email text not null check (invited_email = lower(invited_email) and position('@' in invited_email) > 1),
  role text not null check (role in ('caregiver', 'teacher', 'therapist')),
  member_user_id uuid references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active')),
  created_at timestamp with time zone not null default now(),
  accepted_at timestamp with time zone,
  unique (learner_id, invited_email)
);

create index if not exists idx_support_team_member on public.support_team_members(member_user_id) where status = 'active';
create index if not exists idx_support_team_learner on public.support_team_members(learner_id);

alter table public.support_team_members enable row level security;

-- Owner sees their team; invitee sees invites addressed to their email;
-- members see their own membership.
create policy "support_team_select"
  on public.support_team_members for select
  using (
    owner_id = auth.uid()
    or member_user_id = auth.uid()
    or invited_email = lower(auth.jwt() ->> 'email')
  );

-- Only the learner's owner may invite, and only as a fresh pending invite.
create policy "support_team_insert_owner"
  on public.support_team_members for insert
  with check (
    owner_id = auth.uid()
    and status = 'pending'
    and member_user_id is null
    and accepted_at is null
    and exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = support_team_members.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );

-- Owner removes members/invites; members may leave a team themselves.
create policy "support_team_delete"
  on public.support_team_members for delete
  using (owner_id = auth.uid() or member_user_id = auth.uid());

-- Accepting an invite. Security definer because there is no UPDATE policy;
-- it only ever binds the *caller* to an invite addressed to the caller's
-- own email.
create or replace function public.accept_support_team_invite(invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_email text := lower(auth.jwt() ->> 'email');
begin
  if auth.uid() is null or caller_email is null then
    raise exception 'not signed in';
  end if;

  update public.support_team_members
  set member_user_id = auth.uid(), status = 'active', accepted_at = now()
  where id = invite_id
    and status = 'pending'
    and invited_email = caller_email
    and owner_id <> auth.uid();

  if not found then
    raise exception 'invite not found';
  end if;
end;
$$;

revoke all on function public.accept_support_team_invite(uuid) from public;
grant execute on function public.accept_support_team_invite(uuid) to authenticated;

-- Membership check used by the policies below. Security definer so the
-- policies don't recurse through support_team_members' own RLS.
create or replace function public.is_support_member(p_learner_id uuid, p_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.support_team_members
    where learner_id = p_learner_id
      and member_user_id = auth.uid()
      and status = 'active'
      and (p_roles is null or role = any (p_roles))
  );
$$;

revoke all on function public.is_support_member(uuid, text[]) from public;
grant execute on function public.is_support_member(uuid, text[]) to authenticated;

-- ---- Read access for active members (additive; owner policies untouched) ----

create policy "learner_profiles_select_support_team"
  on public.learner_profiles for select
  using (public.is_support_member(id));

create policy "ieps_select_support_team"
  on public.ieps for select
  using (public.is_support_member(learner_id));

create policy "iep_goals_select_support_team"
  on public.iep_goals for select
  using (
    exists (
      select 1 from public.ieps
      where ieps.id = iep_goals.iep_id
      and public.is_support_member(ieps.learner_id)
    )
  );

create policy "progress_logs_select_support_team"
  on public.progress_logs for select
  using (
    exists (
      select 1 from public.iep_goals
      join public.ieps on ieps.id = iep_goals.iep_id
      where iep_goals.id = progress_logs.goal_id
      and public.is_support_member(ieps.learner_id)
    )
  );

create policy "progress_summaries_select_support_team"
  on public.progress_summaries for select
  using (public.is_support_member(learner_id));

create policy "reports_select_support_team"
  on public.reports for select
  using (public.is_support_member(learner_id, array['caregiver', 'therapist']));

-- ---- Write access ----

-- Any active member can log a check-in, as themselves, on that learner's goals.
create policy "progress_logs_insert_support_team"
  on public.progress_logs for insert
  with check (
    logged_by = auth.uid()
    and exists (
      select 1 from public.iep_goals
      join public.ieps on ieps.id = iep_goals.iep_id
      where iep_goals.id = progress_logs.goal_id
      and public.is_support_member(ieps.learner_id)
    )
  );

-- Therapists can update goals of learners they support...
create policy "iep_goals_update_support_therapist"
  on public.iep_goals for update
  using (
    exists (
      select 1 from public.ieps
      where ieps.id = iep_goals.iep_id
      and public.is_support_member(ieps.learner_id, array['therapist'])
    )
  )
  with check (
    exists (
      select 1 from public.ieps
      where ieps.id = iep_goals.iep_id
      and public.is_support_member(ieps.learner_id, array['therapist'])
    )
  );

-- ...but only status/updated_at. Anyone who isn't the IEP's creator (and
-- isn't the service role) is blocked from changing any other column.
create or replace function public.iep_goals_limit_non_owner_updates()
returns trigger
language plpgsql
as $$
begin
  if current_setting('request.jwt.claims', true) is not null
    and (current_setting('request.jwt.claims', true)::jsonb ->> 'role') <> 'service_role'
    and not exists (select 1 from public.ieps where ieps.id = old.iep_id and ieps.created_by = auth.uid())
    and (
      new.iep_id is distinct from old.iep_id
      or new.goal_text is distinct from old.goal_text
      or new.domain is distinct from old.domain
      or new.target_completion_date is distinct from old.target_completion_date
      or new.baseline is distinct from old.baseline
      or new.target is distinct from old.target
      or new.measurement is distinct from old.measurement
      or new.created_at is distinct from old.created_at
    )
  then
    raise exception 'Support team members can only change a goal''s status.';
  end if;

  return new;
end;
$$;

drop trigger if exists iep_goals_limit_non_owner_updates on public.iep_goals;

create trigger iep_goals_limit_non_owner_updates
  before update on public.iep_goals
  for each row
  execute function public.iep_goals_limit_non_owner_updates();
