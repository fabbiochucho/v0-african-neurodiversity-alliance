-- 006_create_payments_tables.sql's "subscriptions_update_own" policy only
-- restricts which ROW a user can update (user_id = auth.uid()), not which
-- COLUMNS -- the same class of bug found and fixed on NeuRafiki's
-- organizations table (v0-neu-rafiki-self-assessment-app's
-- 020_restrict_organizations_subscription_tier.sql). As written, any
-- authenticated ANDA user can set their own tier to 'pro'/'institutional'
-- and status to 'active' directly via the REST API, with no payment ever
-- happening.
--
-- Fix: a before-update trigger that blocks any change to tier/status/
-- amount_paid/payment_date/renewal_date/flutterwave_ref unless the request
-- is running as the service role (which is what
-- lib/payments/{flutterwave,paystack}.ts's finalizeSuccessfulPayment
-- functions use). The service role bypasses RLS but not triggers, so this
-- explicitly allows service-role writes through while blocking everyone
-- else from touching the payment-controlled fields. Users can still update
-- their own row for anything else (there's currently nothing else on this
-- table a user legitimately would update, but this keeps the policy's
-- original row-level intent intact rather than removing it outright).
create or replace function public.subscriptions_prevent_self_grant()
returns trigger
language plpgsql
as $$
begin
  if (
    new.tier is distinct from old.tier
    or new.status is distinct from old.status
    or new.amount_paid is distinct from old.amount_paid
    or new.payment_date is distinct from old.payment_date
    or new.renewal_date is distinct from old.renewal_date
    or new.flutterwave_ref is distinct from old.flutterwave_ref
  )
    and current_setting('request.jwt.claims', true) is not null
    and (current_setting('request.jwt.claims', true)::jsonb ->> 'role') <> 'service_role'
  then
    raise exception 'tier/status/payment fields can only be changed by a completed payment, not updated directly.';
  end if;

  return new;
end;
$$;

drop trigger if exists subscriptions_prevent_self_grant on public.subscriptions;

create trigger subscriptions_prevent_self_grant
  before update on public.subscriptions
  for each row
  execute function public.subscriptions_prevent_self_grant();
