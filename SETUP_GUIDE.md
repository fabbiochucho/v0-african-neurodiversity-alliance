# ANDA Platform - Complete Setup Guide

## Database Migration Status

Due to Supabase connection timeouts, please manually execute the following SQL migrations in your Supabase dashboard:

### Step 1: Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Execute the following migrations in order (copy each script content):

#### Migration 1: Organizations Table
File: `scripts/002_create_organizations.sql`

\`\`\`sql
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  organization_type text,
  subscription_tier text default 'free',
  max_users integer default 5,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.organizations enable row level security;

create policy "organizations_select_members"
  on public.organizations for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.organization_id = organizations.id
      and profiles.id = auth.uid()
    )
  );
\`\`\`

#### Migration 2: Profiles Table
File: `scripts/001_create_profiles.sql`

\`\`\`sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text unique,
  role text default 'user',
  organization_id uuid references public.organizations(id),
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);
\`\`\`

#### Migration 3: Learner Profiles & IEP Tables
File: `scripts/003_create_iep_tables.sql`

\`\`\`sql
create table if not exists public.learner_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  age integer,
  gender text,
  country text,
  diagnosis_domains jsonb default '[]',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.learner_profiles enable row level security;

create policy "learner_profiles_select_own"
  on public.learner_profiles for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and (profiles.id = learner_profiles.user_id or profiles.organization_id is not null)
    )
  );

create policy "learner_profiles_insert_own"
  on public.learner_profiles for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
    )
  );

create policy "learner_profiles_update_own"
  on public.learner_profiles for update
  using (user_id = auth.uid());

create table if not exists public.ieps (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  title text,
  description text,
  status text default 'draft',
  adaptive_goals jsonb default '[]',
  custom_goals jsonb default '[]',
  ai_summary text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.ieps enable row level security;

create policy "ieps_select_own"
  on public.ieps for select
  using (
    exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = ieps.learner_id
      and learner_profiles.user_id = auth.uid()
    ) or created_by = auth.uid()
  );

create policy "ieps_insert_own"
  on public.ieps for insert
  with check (created_by = auth.uid());

create policy "ieps_update_own"
  on public.ieps for update
  using (created_by = auth.uid());

create table if not exists public.iep_goals (
  id uuid primary key default gen_random_uuid(),
  iep_id uuid not null references public.ieps(id) on delete cascade,
  goal_text text not null,
  domain text,
  status text default 'in_progress',
  target_completion_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.iep_goals enable row level security;

create policy "iep_goals_select_via_iep"
  on public.iep_goals for select
  using (
    exists (
      select 1 from public.ieps
      where ieps.id = iep_goals.iep_id
      and (
        exists (
          select 1 from public.learner_profiles
          where learner_profiles.id = ieps.learner_id
          and learner_profiles.user_id = auth.uid()
        ) or ieps.created_by = auth.uid()
      )
    )
  );

create policy "iep_goals_insert_via_iep"
  on public.iep_goals for insert
  with check (
    exists (
      select 1 from public.ieps
      where ieps.id = iep_goals.iep_id
      and ieps.created_by = auth.uid()
    )
  );
\`\`\`

#### Migration 4: Progress Tracking Tables
File: `scripts/004_create_progress_tables.sql`

\`\`\`sql
create table if not exists public.progress_logs (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.iep_goals(id) on delete cascade,
  logged_by uuid not null references public.profiles(id),
  rating integer check (rating >= 1 and rating <= 5),
  notes text,
  logged_date date default now(),
  created_at timestamp with time zone default now()
);

alter table public.progress_logs enable row level security;

create policy "progress_logs_select_via_goal"
  on public.progress_logs for select
  using (
    exists (
      select 1 from public.iep_goals
      join public.ieps on ieps.id = iep_goals.iep_id
      join public.learner_profiles on learner_profiles.id = ieps.learner_id
      where iep_goals.id = progress_logs.goal_id
      and (learner_profiles.user_id = auth.uid() or ieps.created_by = auth.uid())
    )
  );

create policy "progress_logs_insert_via_goal"
  on public.progress_logs for insert
  with check (logged_by = auth.uid());

create table if not exists public.progress_summaries (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  week_start_date date,
  week_end_date date,
  summary_text text,
  domain_progress jsonb default '{}',
  created_at timestamp with time zone default now()
);

alter table public.progress_summaries enable row level security;

create policy "progress_summaries_select_own"
  on public.progress_summaries for select
  using (
    exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = progress_summaries.learner_id
      and learner_profiles.user_id = auth.uid()
    )
  );
\`\`\`

#### Migration 5: Reports Table
File: `scripts/005_create_reports_tables.sql`

\`\`\`sql
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  generated_by uuid not null references public.profiles(id),
  report_type text,
  report_period text,
  content text,
  pdf_url text,
  email_sent boolean default false,
  email_sent_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.reports enable row level security;

create policy "reports_select_own"
  on public.reports for select
  using (
    exists (
      select 1 from public.learner_profiles
      where learner_profiles.id = reports.learner_id
      and learner_profiles.user_id = auth.uid()
    ) or generated_by = auth.uid()
  );

create policy "reports_insert_own"
  on public.reports for insert
  with check (generated_by = auth.uid());
\`\`\`

#### Migration 6: Payment Tables
File: `scripts/006_create_payments_tables.sql`

\`\`\`sql
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
\`\`\`

#### Migration 7: Profile Trigger
File: `scripts/007_create_profile_trigger.sql`

\`\`\`sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', 'User'),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
\`\`\`

## Environment Variables

Ensure these are set in your `.env.local`:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key (for emails)
\`\`\`

## Testing the Setup

1. **Test Authentication**: Visit `/auth/login` to test login functionality
2. **Test IEP Creation**: Once logged in, visit `/iep/generate` to create an IEP
3. **Test Progress Tracking**: Visit `/iep/progress` to log progress
4. **Test Reports**: Visit `/iep/reports` to view reports

## Deployment Checklist

- [ ] All database migrations executed successfully
- [ ] Environment variables configured
- [ ] Supabase RLS policies enabled
- [ ] Authentication testing complete
- [ ] IEP workflow testing complete
- [ ] Payment integration verified
- [ ] Email service configured (Resend)
- [ ] Deployed to production

## API Endpoints Available

- `POST /api/iep/learner` - Create learner profile
- `POST /api/iep/create` - Generate IEP
- `GET /api/iep/[id]` - Fetch IEP
- `POST /api/progress/log` - Log daily progress
- `GET /api/progress/learner/[learnerId]` - Get learner progress
- `POST /api/reports/generate` - Generate report
- `POST /api/reports/send-email` - Send report via email
- `POST /api/payments/flutterwave/initialize` - Initialize payment
- `GET /api/payments/flutterwave/verify` - Verify payment

For more information, see the complete ANDA project documentation.
