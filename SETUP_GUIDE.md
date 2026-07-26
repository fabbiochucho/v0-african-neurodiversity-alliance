# ANDA Platform - Complete Setup Guide

## Database Migrations

Run the migrations in `scripts/` in numeric order (001 through 010) via the
Supabase SQL Editor. The scripts directory is the source of truth for schema
and RLS policies — this guide intentionally doesn't duplicate their contents,
since a copy here would silently drift out of sync as the scripts change.

1. Go to your Supabase project dashboard → SQL Editor
2. Open each file under `scripts/`, in order, and run its contents:
   - `001_create_profiles.sql`
   - `002_create_organizations.sql`
   - `003_create_iep_tables.sql`
   - `004_create_progress_tables.sql`
   - `005_create_reports_tables.sql`
   - `006_create_payments_tables.sql`
   - `007_create_profile_trigger.sql`
   - `008_add_donation_purpose.sql`
   - `009_create_resources_table.sql`
   - `010_create_linked_accounts.sql` (only needed if you're using the optional cross-app federation feature — see `lib/federation/`)

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
