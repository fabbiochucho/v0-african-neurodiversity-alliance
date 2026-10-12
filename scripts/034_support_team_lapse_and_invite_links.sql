-- Support Team, round 2 (audit item F.7). Depends on scripts/031 and
-- scripts/032 (public.tier_allows).
--
-- 1. Members LOSE access when the learner owner's paid plan lapses, and get
--    it back automatically on renewal: is_support_member() -- which every
--    member policy from 031 goes through -- now also requires the team
--    owner to be entitled to support teams (Pro+) right now.
-- 2. Creating an invite requires Pro+ in the database too.
-- 3. Emailed invite links: an unguessable token (only its SHA-256 hash is
--    stored) with an expiry. Accepting needs the caller's own email to
--    match the invite AND, when a token is given, the token to match and
--    be unexpired. The owner can re-send (new token, new expiry) through a
--    security-definer function; there is still no UPDATE policy.

alter table public.support_team_members
  add column if not exists invite_token_hash text,
  add column if not exists invite_expires_at timestamp with time zone,
  add column if not exists invite_sent_at timestamp with time zone;

-- ---- 1. Lapse ---------------------------------------------------------------
create or replace function public.is_support_member(p_learner_id uuid, p_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.support_team_members m
    where m.learner_id = p_learner_id
      and m.member_user_id = auth.uid()
      and m.status = 'active'
      and (p_roles is null or m.role = any (p_roles))
      and public.tier_allows(m.owner_id, 'pro') -- gate:support_team (owner's plan must be current)
  );
$$;

-- ---- 2. Invite creation requires Pro+ --------------------------------------
drop policy if exists "support_team_insert_owner" on public.support_team_members;

create policy "support_team_insert_owner"
  on public.support_team_members for insert
  with check (
    owner_id = auth.uid()
    and public.tier_allows(auth.uid(), 'pro') -- gate:support_team
    and status = 'pending'
    and member_user_id is null
    and accepted_at is null
    and (invite_expires_at is null or invite_expires_at <= now() + interval '14 days')
    and exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = support_team_members.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );

-- ---- 3. Invite links ----------------------------------------------------------
drop function if exists public.accept_support_team_invite(uuid);

create or replace function public.accept_support_team_invite(invite_id uuid, token_hash text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_email text := lower(auth.jwt() ->> 'email');
  accepted_learner uuid;
begin
  if auth.uid() is null or caller_email is null then
    raise exception 'not signed in';
  end if;

  update public.support_team_members
  set member_user_id = auth.uid(), status = 'active', accepted_at = now(),
      invite_token_hash = null
  where id = invite_id
    and status = 'pending'
    and invited_email = caller_email
    and owner_id <> auth.uid()
    and (invite_expires_at is null or invite_expires_at > now())
    and (token_hash is null or invite_token_hash = token_hash)
  returning learner_id into accepted_learner;

  if accepted_learner is null then
    raise exception 'invite not found, expired, or for a different email address';
  end if;

  return accepted_learner;
end;
$$;

revoke all on function public.accept_support_team_invite(uuid, text) from public;
grant execute on function public.accept_support_team_invite(uuid, text) to authenticated;

-- Owner re-sends a pending invite: new token hash, new expiry (max 14 days).
create or replace function public.refresh_support_team_invite(invite_id uuid, new_token_hash text, expires_at timestamp with time zone)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.tier_allows(auth.uid(), 'pro') then
    raise exception 'upgrade_required';
  end if;

  update public.support_team_members
  set invite_token_hash = new_token_hash,
      invite_expires_at = least(expires_at, now() + interval '14 days'),
      invite_sent_at = now()
  where id = invite_id
    and owner_id = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'invite not found';
  end if;
end;
$$;

revoke all on function public.refresh_support_team_invite(uuid, text, timestamp with time zone) from public;
grant execute on function public.refresh_support_team_invite(uuid, text, timestamp with time zone) to authenticated;
