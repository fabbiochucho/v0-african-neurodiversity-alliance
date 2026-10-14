-- Round 3, PR H, brief §18-19: the full IEP. Depends on 030, 044.
--
-- Official plan = approved goals + approved plan items. Anything drafted
-- (by AI, by a template, or suggested by a team member) stays a draft
-- until someone with 'approve' approves it (approved_by, approved_at).
-- Every approval saves a numbered snapshot in iep_plan_versions.

-- ---- Goals: the full goal shape --------------------------------------------------
alter table public.iep_goals
  add column if not exists frequency text,
  add column if not exists responsible_person text,
  add column if not exists support_strategy text,
  add column if not exists review_date date,
  add column if not exists evidence text,
  add column if not exists source text not null default 'person' check (source in ('person', 'template', 'ai')),
  add column if not exists approval_status text not null default 'approved' check (approval_status in ('draft', 'suggested', 'approved', 'rejected')),
  add column if not exists approved_by uuid references public.profiles(id) on delete set null,
  add column if not exists approved_at timestamp with time zone;

-- Approval fields are written only by approve_plan_items() below (it runs
-- as its owner, so the guard lets it through; signed-in users can't).
create or replace function public.iep_goals_guard_approval()
returns trigger
language plpgsql
as $$
begin
  -- Only end-user roles are restricted. approve_plan_items() (security
  -- definer, runs as its owner) and the service role pass through.
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.approval_status = 'approved' and new.source = 'ai' then
      raise exception 'AI drafts must be approved by a person.';
    end if;
    if new.approved_by is not null or new.approved_at is not null then
      raise exception 'Approval can only be recorded by approving.';
    end if;
  elsif new.approval_status is distinct from old.approval_status
     or new.approved_by is distinct from old.approved_by
     or new.approved_at is distinct from old.approved_at
     or new.source is distinct from old.source then
    raise exception 'Approval can only be recorded by approving.';
  end if;
  return new;
end;
$$;

drop trigger if exists iep_goals_guard_approval on public.iep_goals;
create trigger iep_goals_guard_approval before insert or update on public.iep_goals
  for each row execute function public.iep_goals_guard_approval();

-- Non-owners may change a goal's status; with 'manage_plan' also its
-- content (replaces 031's status-only rule).
create or replace function public.iep_goals_limit_non_owner_updates()
returns trigger
language plpgsql
as $$
declare
  learner uuid;
begin
  select ieps.learner_id into learner from public.ieps where ieps.id = old.iep_id;
  if current_setting('request.jwt.claims', true) is not null
    and (current_setting('request.jwt.claims', true)::jsonb ->> 'role') <> 'service_role'
    and not exists (select 1 from public.learner_profiles l where l.id = learner and l.user_id = auth.uid())
    and not public.has_permission(learner, 'manage_plan')
    and (
      new.iep_id is distinct from old.iep_id or new.goal_text is distinct from old.goal_text
      or new.domain is distinct from old.domain or new.target_completion_date is distinct from old.target_completion_date
      or new.baseline is distinct from old.baseline or new.target is distinct from old.target
      or new.measurement is distinct from old.measurement or new.frequency is distinct from old.frequency
      or new.responsible_person is distinct from old.responsible_person or new.support_strategy is distinct from old.support_strategy
      or new.review_date is distinct from old.review_date or new.evidence is distinct from old.evidence
      or new.created_at is distinct from old.created_at
    )
  then
    raise exception 'You can only change this goal''s status.';
  end if;
  return new;
end;
$$;

-- Team members with suggest_goal may add *suggested* goals (or manage_plan: drafts).
create policy "iep_goals_insert_team" on public.iep_goals for insert
  with check (exists (
    select 1 from public.ieps where ieps.id = iep_goals.iep_id
    and (
      (iep_goals.approval_status = 'suggested' and public.has_permission(ieps.learner_id, 'suggest_goal'))
      or (iep_goals.approval_status in ('draft', 'suggested') and public.has_permission(ieps.learner_id, 'manage_plan'))
    )
  ));

-- ---- Plan-level content ---------------------------------------------------------
create table if not exists public.iep_plan_items (
  id uuid primary key default gen_random_uuid(),
  iep_id uuid not null references public.ieps(id) on delete cascade,
  section text not null check (section in (
    'accommodations', 'modifications', 'teaching_strategies', 'communication_strategies', 'sensory_strategies',
    'executive_function_strategies', 'social_strategies', 'behavioural_strategies', 'assistive_technology',
    'family_strategies', 'school_strategies', 'professional_support', 'timeline'
  )),
  content text not null check (char_length(content) between 1 and 2000),
  source text not null default 'person' check (source in ('person', 'template', 'ai')),
  status text not null default 'draft' check (status in ('draft', 'suggested', 'approved', 'rejected')),
  created_by uuid references public.profiles(id) on delete set null,
  edited boolean not null default false,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_iep_plan_items_iep on public.iep_plan_items(iep_id);
alter table public.iep_plan_items enable row level security;

create policy "iep_plan_items_select" on public.iep_plan_items for select
  using (exists (select 1 from public.ieps where ieps.id = iep_plan_items.iep_id and public.has_permission(ieps.learner_id, 'view')));

create policy "iep_plan_items_insert" on public.iep_plan_items for insert
  with check (
    created_by = auth.uid()
    and approved_by is null and approved_at is null
    and status in ('draft', 'suggested')
    and exists (
      select 1 from public.ieps where ieps.id = iep_plan_items.iep_id
      and (public.has_permission(ieps.learner_id, 'manage_plan')
           or (iep_plan_items.status = 'suggested' and public.has_permission(ieps.learner_id, 'suggest_goal')))
    )
  );

-- Editing a draft's text (marks it edited). Status/approval columns are
-- guarded by the trigger below; approved items are changed by a new item.
create policy "iep_plan_items_update" on public.iep_plan_items for update
  using (exists (select 1 from public.ieps where ieps.id = iep_plan_items.iep_id and public.has_permission(ieps.learner_id, 'manage_plan')))
  with check (exists (select 1 from public.ieps where ieps.id = iep_plan_items.iep_id and public.has_permission(ieps.learner_id, 'manage_plan')));

create policy "iep_plan_items_delete" on public.iep_plan_items for delete
  using (
    status <> 'approved'
    and exists (select 1 from public.ieps where ieps.id = iep_plan_items.iep_id and public.has_permission(ieps.learner_id, 'manage_plan'))
  );

create or replace function public.iep_plan_items_guard()
returns trigger
language plpgsql
as $$
begin
  -- Only end-user roles are restricted. approve_plan_items() (security
  -- definer, runs as its owner) and the service role pass through.
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if old.status = 'approved' then
    raise exception 'Approved plan content is kept as approved. Add a new item to change it.';
  end if;
  if new.status is distinct from old.status or new.approved_by is distinct from old.approved_by
     or new.approved_at is distinct from old.approved_at or new.source is distinct from old.source
     or new.iep_id is distinct from old.iep_id or new.section is distinct from old.section then
    raise exception 'Only the text of a draft can be edited.';
  end if;
  new.edited := true;
  return new;
end;
$$;

drop trigger if exists iep_plan_items_guard on public.iep_plan_items;
create trigger iep_plan_items_guard before update on public.iep_plan_items
  for each row execute function public.iep_plan_items_guard();

-- ---- Versions and approval --------------------------------------------------------
create table if not exists public.iep_plan_versions (
  id uuid primary key default gen_random_uuid(),
  iep_id uuid not null references public.ieps(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamp with time zone not null default now(),
  unique (iep_id, version)
);

alter table public.iep_plan_versions enable row level security;
create policy "iep_plan_versions_select" on public.iep_plan_versions for select
  using (exists (select 1 from public.ieps where ieps.id = iep_plan_versions.iep_id and public.has_permission(ieps.learner_id, 'view')));

-- Approves the given draft/suggested goals and items (or rejects them) and
-- saves a new version of the official plan. Requires 'approve'.
create or replace function public.approve_plan_items(p_iep_id uuid, p_goal_ids uuid[], p_item_ids uuid[], p_reject boolean default false)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  learner uuid;
  next_version integer;
begin
  select learner_id into learner from public.ieps where id = p_iep_id;
  if learner is null or not public.has_permission(learner, 'approve') then
    raise exception 'You need approve rights for this plan.';
  end if;

  update public.iep_goals set
    approval_status = case when p_reject then 'rejected' else 'approved' end,
    approved_by = case when p_reject then null else auth.uid() end,
    approved_at = case when p_reject then null else now() end
  where iep_id = p_iep_id and id = any (coalesce(p_goal_ids, '{}')) and approval_status in ('draft', 'suggested');

  update public.iep_plan_items set
    status = case when p_reject then 'rejected' else 'approved' end,
    approved_by = case when p_reject then null else auth.uid() end,
    approved_at = case when p_reject then null else now() end
  where iep_id = p_iep_id and id = any (coalesce(p_item_ids, '{}')) and status in ('draft', 'suggested');

  if p_reject then
    return null;
  end if;

  select coalesce(max(version), 0) + 1 into next_version from public.iep_plan_versions where iep_id = p_iep_id;
  insert into public.iep_plan_versions (iep_id, version, approved_by, snapshot)
  values (
    p_iep_id, next_version, auth.uid(),
    jsonb_build_object(
      'goals', (select coalesce(jsonb_agg(to_jsonb(g) - 'iep_id' order by g.created_at), '[]') from public.iep_goals g
                where g.iep_id = p_iep_id and g.approval_status = 'approved'),
      'items', (select coalesce(jsonb_agg(to_jsonb(i) - 'iep_id' order by i.section, i.created_at), '[]') from public.iep_plan_items i
                where i.iep_id = p_iep_id and i.status = 'approved')
    )
  );
  return next_version;
end;
$$;

revoke all on function public.approve_plan_items(uuid, uuid[], uuid[], boolean) from public;
grant execute on function public.approve_plan_items(uuid, uuid[], uuid[], boolean) to authenticated;
