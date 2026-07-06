-- Distinguish subscription payments from one-off anonymous donations by
-- reusing payment_transactions instead of creating a separate donations
-- table. Donation rows have subscription_id = null and purpose = 'donation'.

alter table public.payment_transactions
  add column if not exists purpose text not null default 'subscription';

alter table public.payment_transactions
  add column if not exists donor_name text;

alter table public.payment_transactions
  add column if not exists donor_email text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payment_transactions_purpose_check'
  ) then
    alter table public.payment_transactions
      add constraint payment_transactions_purpose_check check (purpose in ('subscription', 'donation'));
  end if;
end $$;

comment on column public.payment_transactions.purpose is
  'Distinguishes subscription payments from one-off donations. Donation rows have subscription_id = null.';
comment on column public.payment_transactions.donor_name is
  'Optional donor-supplied name, only set for purpose = ''donation'' rows (donors are not authenticated).';
comment on column public.payment_transactions.donor_email is
  'Optional donor-supplied email, only set for purpose = ''donation'' rows (donors are not authenticated).';

-- payment_transactions rows are written exclusively by server routes using
-- the Supabase service role client (see lib/supabase/service.ts), which
-- bypasses RLS. This lets anonymous donors' payment rows be created/updated
-- without needing broad anon insert/update policies on a sensitive table.
