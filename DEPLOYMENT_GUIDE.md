# ANDA Platform - Deployment Guide

## Pre-Deployment Checklist

### Phase 1: Local Testing (Development)

- [ ] Clone repository from GitHub
- [ ] Install dependencies: `npm install`
- [ ] Create `.env.local` file with development credentials
- [ ] Start dev server: `npm run dev`
- [ ] Visit http://localhost:3000 and verify landing page loads
- [ ] Execute all 7 SQL migration scripts in Supabase console
- [ ] Test authentication flow at `/test/auth-test`
- [ ] Test IEP workflow at `/test/iep-test`
- [ ] Test payment integration at `/test/payment-test`
- [ ] Check browser console for errors
- [ ] Test on mobile device/responsive design

### Phase 2: Pre-Production Verification

- [ ] All environment variables configured in `.env.local`
- [ ] Database migrations completed successfully
- [ ] Supabase RLS policies verified
- [ ] Authentication working (sign-up, login, logout)
- [ ] IEP creation functional
- [ ] Progress logging working
- [ ] Reports generating without errors
- [ ] Payment tests completing successfully
- [ ] Email service responding (Resend API key valid)
- [ ] No console errors or warnings
- [ ] Page load times acceptable
- [ ] All links working correctly

## Step-by-Step Deployment to Vercel

### Step 1: Prepare GitHub Repository

\`\`\`bash
# If not already done, initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial ANDA deployment commit"

# Create main branch
git branch -M main

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/v0-african-neurodiversity-alliance.git

# Push to GitHub
git push -u origin main
\`\`\`

### Step 2: Connect to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub account
3. Import the `v0-african-neurodiversity-alliance` repository
4. Select Next.js framework (should auto-detect)
5. Configure project settings:
   - **Project Name:** `anda-platform`
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

### Step 3: Configure Environment Variables in Vercel

In Vercel project settings, add the following environment variables:

1. Go to Settings → Environment Variables
2. Add each variable from your secure configuration:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `FLUTTERWAVE_SECRET_KEY` - Your Flutterwave secret key (server-side only)
- `RESEND_API_KEY` - Your Resend email API key
- `NEXT_PUBLIC_APP_URL=https://anda-platform.vercel.app`
- `NODE_ENV=production`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://anda-platform.vercel.app/auth/callback`

**Note:** The Flutterwave public key is fetched from a server endpoint to avoid exposing it as an environment variable.

**IMPORTANT:** Never commit actual API keys to GitHub. Use Vercel's environment variable UI or GitHub secrets to manage sensitive values.

**Note:** Vercel will auto-detect POSTGRES_* variables from Supabase integration if available.

### Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete (usually 2-3 minutes)
3. Verify deployment URL: `https://anda-platform.vercel.app`

### Step 5: Update Supabase Configuration

1. Go to Supabase Dashboard → Project Settings → Auth → URL Configuration
2. Add production redirect URL:
   - `https://anda-platform.vercel.app/auth/callback`

### Step 6: Update DNS (if using custom domain)

If you have a custom domain:

1. In Vercel: Project Settings → Domains
2. Add your custom domain (e.g., `anda.org`)
3. Update DNS records according to Vercel instructions
4. Update Supabase redirect URL with custom domain

### Step 7: Production Smoke Tests

1. Visit production URL: `https://anda-platform.vercel.app`
2. Verify homepage loads correctly
3. Test authentication flow
4. Create test learner and IEP
5. Test payment integration with test card
6. Check Supabase for created records
7. Verify no errors in Vercel logs

## Monitoring & Maintenance

### Daily Checks

- [ ] Check Vercel deployment status
- [ ] Monitor Supabase database metrics
- [ ] Review error logs in Vercel

### Weekly Checks

- [ ] Verify authentication system working
- [ ] Test IEP creation and progress logging
- [ ] Check payment transaction logs
- [ ] Review user feedback

### Monthly Checks

- [ ] Database backup verification
- [ ] Security audit of RLS policies
- [ ] Performance optimization review
- [ ] Feature analytics review

## Rollback Procedure

If deployment fails or issues arise:

\`\`\`bash
# Revert to previous version in Vercel
# Go to Vercel Dashboard → Deployments → Previous deployment → Promote to Production

# Or revert code locally
git revert HEAD
git push origin main
\`\`\`

## Common Issues & Solutions

### Issue: 503 Build Error
**Solution:** Check environment variables are all set in Vercel. Missing API keys cause build failures.

### Issue: Authentication Not Working
**Solution:** 
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
2. Check Supabase redirect URL is updated
3. Clear browser cookies and try again

### Issue: Database Connection Timeout
**Solution:**
1. Verify Supabase project is not paused
2. Check POSTGRES_URL_NON_POOLING is set
3. Contact Supabase support if timeouts persist

### Issue: Payments Not Processing
**Solution:**
1. Verify `FLUTTERWAVE_SECRET_KEY` and `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` are correct
2. Check Flutterwave account is active
3. Ensure test credentials used in test environment

### Issue: Emails Not Sending
**Solution:**
1. Verify `RESEND_API_KEY` is valid
2. Check Resend dashboard for API key status
3. Verify sender email is verified in Resend

## Vercel Deployment Dashboard

Monitor your deployment at:
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Flutterwave Dashboard:** https://dashboard.flutterwave.com

## CI/CD Pipeline

Every push to `main` branch automatically:
1. Triggers build in Vercel
2. Runs tests (if configured)
3. Deploys to production on success
4. Sends deployment notifications

## Health Check URLs

Once deployed, monitor these endpoints:

- Homepage: `https://anda-platform.vercel.app/`
- API Health: `https://anda-platform.vercel.app/api/health`
- Auth: `https://anda-platform.vercel.app/auth/login`
- IEP: `https://anda-platform.vercel.app/iep`

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Flutterwave Docs:** https://developer.flutterwave.com

## Post-Deployment

After successful deployment:

1. Share production URL with team
2. Update marketing materials with live URL
3. Set up monitoring alerts
4. Schedule user training sessions
5. Create user onboarding guides
6. Monitor for initial user feedback

## Success Metrics

Monitor these after launch:

- Page load time < 2 seconds
- 99.9% uptime
- Auth success rate > 99%
- Payment success rate > 95%
- Zero critical errors
- User satisfaction > 4/5 stars
