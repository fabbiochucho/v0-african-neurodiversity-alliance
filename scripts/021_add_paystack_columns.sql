-- Adds Paystack support alongside the existing Flutterwave integration.
-- Purely additive: existing Flutterwave rows are untouched (provider
-- defaults to 'flutterwave', paystack_reference stays null for them).
alter table public.payment_transactions
  add column if not exists provider text not null default 'flutterwave',
  add column if not exists paystack_reference text;
