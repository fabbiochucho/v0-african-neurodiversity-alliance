-- Opt-in newsletter (privacy policy "Newsletter" section, NDPC filing NDPC/DPC/15933).
-- Consent is separate from the account: an unticked box at sign-up or the switch on
-- Account > Privacy. We keep who agreed, when, through which form and the exact wording
-- they saw. Unsubscribing sets unsubscribed_at; the row stays as the consent record.
-- Service role only: no grants to anon or authenticated.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  first_name text,
  user_id uuid references auth.users (id) on delete set null,
  token uuid not null unique default gen_random_uuid(),
  consent_text text not null check (char_length(consent_text) between 10 and 1000),
  consent_source text not null check (consent_source in ('sign_up', 'account')),
  consented_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists newsletter_subscribers_active_idx
  on public.newsletter_subscribers (consented_at) where unsubscribed_at is null;
alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from anon, authenticated;

create table if not exists public.newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (char_length(subject) between 1 and 200),
  body text not null check (char_length(body) between 1 and 50000),
  sent_by text not null,
  recipients integer not null default 0,
  failed integer not null default 0,
  sent_at timestamptz not null default now()
);
alter table public.newsletter_issues enable row level security;
revoke all on public.newsletter_issues from anon, authenticated;

-- Sign-up: the box only records the choice in the new user's metadata. They are
-- subscribed once they confirm their email, which proves the address is theirs.
create or replace function public.newsletter_subscribe_on_confirm()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null
     and (tg_op = 'INSERT' or old.email_confirmed_at is null)
     and coalesce(new.raw_user_meta_data ->> 'newsletter_opt_in', '') = 'true'
     and char_length(coalesce(new.raw_user_meta_data ->> 'newsletter_consent_text', '')) between 10 and 1000
  then
    insert into public.newsletter_subscribers (email, first_name, user_id, consent_text, consent_source, consented_at)
    values (
      lower(new.email),
      nullif(left(new.raw_user_meta_data ->> 'first_name', 100), ''),
      new.id,
      new.raw_user_meta_data ->> 'newsletter_consent_text',
      'sign_up',
      coalesce((new.raw_user_meta_data ->> 'newsletter_consented_at')::timestamptz, now())
    )
    on conflict (email) do nothing;
  end if;
  return new;
exception when others then
  -- Never block sign-up or confirmation over the newsletter.
  return new;
end;
$$;
revoke all on function public.newsletter_subscribe_on_confirm() from public, anon, authenticated;

drop trigger if exists on_auth_user_newsletter on auth.users;
create trigger on_auth_user_newsletter
  after insert or update of email_confirmed_at on auth.users
  for each row
  execute function public.newsletter_subscribe_on_confirm();
