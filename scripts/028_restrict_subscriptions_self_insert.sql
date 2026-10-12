-- 022 closed the UPDATE path for self-granting a paid tier, but
-- 006's "subscriptions_insert_own" policy still only checks user_id, so a
-- user could INSERT a row that is already tier='pro', status='active' with
-- a far-future renewal_date straight through the REST API.
--
-- lib/entitlements.ts already refuses to honour a subscription without a
-- successful payment_transactions row (which users cannot insert), so this
-- is defence in depth: the only row a user may create is a 'pending'
-- checkout row with no payment fields set -- exactly what
-- app/api/payments/{flutterwave,paystack}/initialize insert. Activation
-- stays service-role only (022's trigger + finalize*Payment).
drop policy if exists "subscriptions_insert_own" on public.subscriptions;

create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and tier in ('premium', 'pro', 'institutional')
    and amount_paid is null
    and payment_date is null
    and renewal_date is null
    and flutterwave_ref is null
  );
