# ANDA Platform - Testing Guide

## Database Migrations

Before running the application, execute the following SQL scripts in your Supabase SQL Editor (at https://supabase.com/dashboard):

### Step 1: Execute Migrations in Order

Copy and paste each script below into the SQL Editor and click "Run":

### Script 1: Create Organizations Table
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

### Script 2: Create Profiles Table
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

### Script 3: Create Learner Profiles and IEPs Tables
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
    user_id = auth.uid() or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id is not null
    )
  );

create policy "learner_profiles_insert_own"
  on public.learner_profiles for insert
  with check (user_id = auth.uid());

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

### Script 4: Create Progress Tables
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

### Script 5: Create Reports Table
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

### Script 6: Create Payment Tables
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

### Script 7: Create Profile Trigger
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

## Testing Workflows

### 1. Authentication Flow Test

1. Start the development server: `npm run dev`
2. Navigate to http://localhost:3000/auth/sign-up
3. Create an account with:
   - Email: test@example.com
   - Password: TestPassword123!
4. Verify email confirmation page appears
5. Check Supabase Auth dashboard to confirm user created
6. Navigate to http://localhost:3000/auth/login
7. Login with the test credentials
8. Verify redirect to protected dashboard

**Expected Result:** User successfully created, email confirmed, and authenticated

### 2. IEP Workflow Test

1. After login, navigate to http://localhost:3000/iep/generate
2. **Step 1 - Create Learner Profile:**
   - Name: John Doe
   - Age: 8
   - Country: Ghana
   - Click "Next"
3. **Step 2 - Select Diagnosis Domains:**
   - Check "ASD" and "ADHD"
   - Click "Next"
4. **Step 3 - Review Goals:**
   - System generates adaptive goals for checked domains
   - Click "Add Custom Goal"
   - Add: "Improve reading comprehension"
   - Click "Next"
5. **Step 4 - Create IEP:**
   - Review all settings
   - Click "Create IEP"
6. Check dashboard at http://localhost:3000/iep/dashboard
7. Navigate to http://localhost:3000/iep/progress/[learnerId]/log
8. Log daily progress for goals (1-5 rating)

**Expected Result:** IEP created successfully, progress logged, and visible on dashboard

### 3. Payment Integration Test

1. Navigate to http://localhost:3000/iep/settings/subscription
2. Click "Upgrade to Premium" ($4.99/month)
3. You'll be redirected to Flutterwave payment page
4. Use Flutterwave test card: `4242 4242 4242 4242`
5. Expiry: `09/25`
6. CVV: `123`
7. Verify payment success message
8. Check Supabase: subscription tier should be updated to "premium"

**Expected Result:** Payment processed, subscription activated

### 4. Report Generation Test

1. Navigate to http://localhost:3000/iep/reports
2. Click "Generate Monthly Report"
3. System generates report with progress analytics
4. Click "Send Email Report"
5. Verify email received (check spam folder)
6. Check Supabase reports table for entry

**Expected Result:** Report generated and emailed successfully

## Deployment Checklist

- [ ] All database migrations executed
- [ ] Environment variables configured (.env.local)
- [ ] Authentication flow tested
- [ ] IEP creation workflow tested
- [ ] Progress logging tested
- [ ] Flutterwave payments tested
- [ ] Email service verified
- [ ] All pages responding without errors
- [ ] Mobile responsiveness verified
- [ ] Accessibility checked (keyboard navigation, screen reader)
- [ ] Performance optimized (no console errors)

## Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables to Vercel project settings
4. Deploy main branch
5. Update Supabase redirect URL: `https://your-domain.vercel.app/auth/callback`
6. Run final smoke tests on production

## Support

For issues:
1. Check Supabase logs: Dashboard → Logs
2. Check Next.js logs: `npm run dev` output
3. Verify all environment variables set
4. Ensure database migrations complete
5. Test with fresh browser session
