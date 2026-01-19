-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tier text default 'free',
  status text default 'active',
  flutterwave_ref text,
  amount_paid decimal(10, 2),
  payment_date timestamp with time zone,
  renewal_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (user_id = auth.uid());

create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (user_id = auth.uid());

create policy "subscriptions_update_own"
  on public.subscriptions for update
  using (user_id = auth.uid());

-- Create payment transactions table
create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  transaction_id text unique,
  flutterwave_transaction_id text,
  amount decimal(10, 2),
  currency text default 'USD',
  status text default 'pending',
  created_at timestamp with time zone default now()
);

alter table public.payment_transactions enable row level security;

create policy "payment_transactions_select_own"
  on public.payment_transactions for select
  using (
    exists (
      select 1 from public.subscriptions
      where subscriptions.id = payment_transactions.subscription_id
      and subscriptions.user_id = auth.uid()
    )
  );
