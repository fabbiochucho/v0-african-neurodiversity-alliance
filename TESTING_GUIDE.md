# ANDA Platform - Testing Guide

## Database Migrations

Before running the application, execute the SQL scripts under `scripts/` (001
through 010) in order via the Supabase SQL Editor. See `SETUP_GUIDE.md` for
the full file list — this guide doesn't duplicate it, so the two can't drift
out of sync with each other or with the actual scripts.

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
