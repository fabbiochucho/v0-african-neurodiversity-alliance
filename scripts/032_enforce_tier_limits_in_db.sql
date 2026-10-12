-- Enforce IEP Tracker tier limits in the database as well as the app
-- (audit round 2). These functions are the SQL twin of lib/entitlements.ts;
-- tests/unit/entitlements-sql.test.ts checks the two stay in step.
--
-- Same rule as effectiveTier(): a paid tier counts only if the
-- subscription is active, unexpired, and backed by a successful
-- payment_transactions row. Everything else is 'free'.

create or replace function public.tier_rank(p_tier text)
returns integer
language sql
immutable
as $$
  select case p_tier when 'premium' then 1 when 'pro' then 2 when 'institutional' then 3 else 0 end;
$$;

-- Learner profile caps per tier (owner-approved: 1 / 3 / 10 / 50).
create or replace function public.learner_limit(p_tier text)
returns integer
language sql
immutable
as $$
  select case p_tier when 'premium' then 3 when 'pro' then 10 when 'institutional' then 50 else 1 end;
$$;

-- Security definer because policies need the tier of *another* user (e.g.
-- the owner of a learner a support-team member is viewing), and
-- subscriptions RLS only exposes your own rows. It returns just a tier name.
create or replace function public.entitled_tier(p_user uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select s.tier
      from public.subscriptions s
      where s.user_id = p_user
        and s.status = 'active'
        and s.tier in ('premium', 'pro', 'institutional')
        and s.renewal_date > now()
        and exists (
          select 1 from public.payment_transactions t
          where t.subscription_id = s.id and t.status = 'successful'
        )
      order by public.tier_rank(s.tier) desc
      limit 1
    ),
    'free'
  );
$$;

create or replace function public.tier_allows(p_user uuid, p_min_tier text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.tier_rank(public.entitled_tier(p_user)) >= public.tier_rank(p_min_tier);
$$;

revoke all on function public.entitled_tier(uuid) from public;
revoke all on function public.tier_allows(uuid, text) from public;
grant execute on function public.entitled_tier(uuid) to authenticated, service_role;
grant execute on function public.tier_allows(uuid, text) to authenticated, service_role;

-- ---- Learner cap: BEFORE INSERT trigger on learner_profiles -------------
create or replace function public.learner_profiles_enforce_cap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Serialise concurrent inserts for the same owner so the count is exact.
  perform pg_advisory_xact_lock(hashtext('learner_cap:' || new.user_id::text));

  if (select count(*) from public.learner_profiles where user_id = new.user_id)
     >= public.learner_limit(public.entitled_tier(new.user_id)) then
    raise exception 'learner_limit_reached: your plan allows % learner profile(s)',
      public.learner_limit(public.entitled_tier(new.user_id))
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists learner_profiles_enforce_cap on public.learner_profiles;

create trigger learner_profiles_enforce_cap
  before insert on public.learner_profiles
  for each row
  execute function public.learner_profiles_enforce_cap();

-- ---- Reports: generating one requires Premium or above ------------------
drop policy if exists "reports_insert_own" on public.reports;

create policy "reports_insert_own"
  on public.reports for insert
  with check (
    generated_by = auth.uid()
    and public.tier_allows(auth.uid(), 'premium') -- gate:reports
    and exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = reports.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );

-- ---- Emailing reports requires Pro or above ------------------------------
-- The email itself is sent by app/api/reports/send-email (which checks the
-- tier first); this stops a lower tier from recording a report as emailed.
create or replace function public.reports_enforce_email_gate()
returns trigger
language plpgsql
as $$
begin
  if new.email_sent is true and old.email_sent is distinct from true
    and current_setting('request.jwt.claims', true) is not null
    and (current_setting('request.jwt.claims', true)::jsonb ->> 'role') <> 'service_role'
    and not public.tier_allows(auth.uid(), 'pro') -- gate:email_reports
  then
    raise exception 'upgrade_required: emailing reports needs the Pro plan' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists reports_enforce_email_gate on public.reports;

create trigger reports_enforce_email_gate
  before update on public.reports
  for each row
  execute function public.reports_enforce_email_gate();
