# ANDA Operations & Monitoring Guide

## Infrastructure Overview

### Production Stack
- **Frontend:** Next.js 14+ (Vercel deployment)
- **Backend:** Node.js/TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Vercel Blob
- **Monitoring:** Sentry + Vercel Analytics
- **Email:** Resend
- **Payments:** Flutterwave

### Deployment Architecture
```
                    Users (Africa)
                          |
                          v
        Vercel CDN (Global Edge Locations)
                          |
        ├─────────────────┼─────────────────┤
        v                 v                 v
    Web App         API Routes         Static Assets
  (Next.js)      (Server Functions)    (Images/CSS)
        |                 |                 |
        └─────────────────┼─────────────────┤
                          v
                    Vercel Backend
                          |
        ├─────────────────┼─────────────────┤
        v                 v                 v
   Supabase DB      File Storage        Analytics
   (PostgreSQL)    (Vercel Blob)      (Sentry/GA)
```

---

## Daily Operations Checklist

### Morning (8 AM UTC)

**1. System Health Check (5 minutes)**
```
□ Uptime check (Should be 99.9%+)
□ Error rate check (Should be <1%)
□ Database status (CPU <80%, Disk <90%)
□ API response time (Should be <300ms)
□ Auth service status
```

**2. Overnight Issues Review (10 minutes)**
```
□ Check Sentry for errors
□ Review user-submitted bug reports
□ Check moderator flags/reports
□ Review critical alerts
□ Note any patterns
```

**3. Email & Support Review (15 minutes)**
```
□ Check support@anda.africa inbox
□ Triage by severity (Critical/High/Medium)
□ Assign to team members
□ Respond to urgent issues
□ Create tickets for bugs
```

**Daily Standup (30 minutes)**
- Discuss overnight issues
- Assign daily tasks
- Review user feedback summary
- Identify blockers

### Throughout the Day

**Continuous Monitoring**
- Sentry dashboard open
- Vercel deployment status
- Supabase monitoring
- Support inbox (check every 2 hours)
- Forum moderation queue

**Performance Monitoring**
- API response times trending
- Database query performance
- Error rates by endpoint
- User load patterns
- Resource utilization

### Evening (6 PM UTC)

**Daily Metrics Review (15 minutes)**
```
□ Daily active users (DAU)
□ New sign-ups today
□ Assessments completed
□ Forum posts created
□ Resource views
□ Critical errors (if any)
```

**Deploy & Testing**
- Run automated tests
- Deploy to staging if changes made
- Monitor staging for issues
- Prepare deployment notes

---

## Weekly Operations

### Monday Morning (Weekly Kickoff)

**Metrics Review**
- Weekly user growth
- Feature usage breakdown
- Error trends
- Performance trends
- Support ticket volume

**Roadmap Review**
- Upcoming features
- Bug fixes in progress
- Performance improvements
- Security updates

**Team Sync**
- Wins from last week
- Challenges faced
- Next week priorities
- Resource needs

### Wednesday (Mid-Week Check-In)

**Quick Status Check**
- Any emerging issues?
- User feedback patterns?
- Performance changes?
- Moderation load?

### Friday (Weekly Wrap-Up)

**Week in Review (1 hour)**
- Metrics summary
- Top 3 wins
- Top 3 challenges
- User feedback highlights
- Next week prep

**Moderator Sync (30 minutes)**
- Moderation queue status
- Guidelines clarity
- Training needs
- Escalations review

---

## Monitoring Dashboard

### Real-Time Metrics to Track

**User Metrics**
```
├─ Total registered users
├─ Daily active users (DAU)
├─ Weekly active users (WAU)
├─ Monthly active users (MAU)
├─ New sign-ups (today/this week)
├─ Churn rate
└─ Retention rate (day 1, 7, 30)
```

**Feature Usage**
```
├─ Assessment starts
├─ Assessment completions
├─ Assessment completion rate
├─ IEP generations
├─ Forum discussions created
├─ Forum posts written
├─ Resource views
└─ Favorite saves
```

**System Health**
```
├─ API uptime (target: 99.9%)
├─ Average response time (target: <300ms)
├─ Error rate (target: <1%)
├─ Database CPU (target: <60%)
├─ Database memory (target: <80%)
├─ Storage used (target: monitoring)
└─ Concurrent users (current)
```

**Performance**
```
├─ Slowest endpoints
├─ Most called endpoints
├─ Error rate by endpoint
├─ Response time by endpoint
├─ Database query slowlog
└─ Cache hit rate
```

### Alert Thresholds

**Critical (Page team immediately)**
- API uptime < 99%
- Error rate > 5%
- Response time > 1 second
- Database CPU > 90%
- Database disk > 95%
- Auth service down

**High (Address within 4 hours)**
- API uptime < 99.5%
- Error rate > 2%
- Response time > 500ms
- Database CPU > 80%
- Support queue > 50 items

**Medium (Address within 24 hours)**
- Error rate > 1%
- Response time > 300ms
- New bug reports > 5
- Moderation queue > 20

---

## Incident Response Procedures

### Step 1: Detection (0-5 minutes)
```
1. Automated alert triggers (Sentry/Vercel)
2. Team member sees alert notification
3. Severity assessment
4. Incident Slack channel created (#incident-YYMMDD-HH)
```

### Step 2: Response (5-15 minutes)
```
1. Incident commander assigned
2. Initial diagnosis (check logs/monitoring)
3. Affected users notified (if >1% impacted)
4. Status page updated (if public incident)
5. Team gathered (Zoom call if critical)
```

### Step 3: Resolution (15-60 minutes)
```
1. Root cause identified
2. Fix deployed OR rollback executed
3. Monitoring confirms resolution
4. Users notified of fix
5. Status page updated
```

### Step 4: Post-Mortem (24-48 hours)
```
1. Root cause documented
2. Impact analysis (affected users, data)
3. Lessons learned captured
4. Action items assigned
5. Process improvement implemented
```

### Incident Severity Levels

**Critical (P1)**
- Users unable to access platform
- Data loss or security breach
- Payment system down
- >10% users affected
- Response time: 15 minutes

**High (P2)**
- Major feature broken
- 1-10% users affected
- Performance severely degraded
- Response time: 1 hour

**Medium (P3)**
- Minor feature issue
- <1% users affected
- Workaround available
- Response time: 4 hours

---

## Database Management

### Daily Backup Verification
```bash
✓ Automated daily backups to Supabase
✓ Point-in-time recovery enabled
✓ Backup encryption enabled
✓ Backup integrity tested weekly
```

### Query Performance Monitoring

**Slow Query Log (Review Daily)**
- Queries taking >1 second
- Identify missing indexes
- Optimize N+1 queries
- Cache frequently-accessed data

**Common Optimizations**
1. Add indexes on frequently filtered columns
2. Denormalize frequently-joined data
3. Implement query result caching
4. Archive old assessment data
5. Partition large tables

### Database Capacity Planning

**Current Usage:**
- Database size: Monitor weekly
- Table growth rates
- Connection pool usage
- Storage growth projection

**Scaling Triggers:**
- Database size > 100GB → Archive & optimize
- Connections > 50 → Increase pool
- CPU > 70% sustained → Scale resources

---

## Security Operations

### Daily Security Checks
```
□ Review failed login attempts (>10 in 1 hour = alert)
□ Check for unusual API activity
□ Review moderator actions (for abuse)
□ Monitor for data exfiltration attempts
□ Check rate limit effectiveness
```

### Weekly Security Tasks
```
□ Review new user sign-ups for suspicious patterns
□ Check SSL certificate expiry (>60 days)
□ Review firewall rules
□ Check for unpatched dependencies
□ Test authentication flows
```

### Monthly Security Tasks
```
□ Full security audit of code changes
□ Review user access & permissions
□ Test backup restoration
□ Review & rotate API keys
□ Penetration testing (external)
□ Security policy update if needed
```

---

## Scaling Operations

### When to Scale Up

**Add Resources When:**
1. Response time > 500ms sustained
2. Database CPU > 75% for >1 hour
3. Error rate > 1.5%
4. Support team response > 24 hours
5. Concurrent users near capacity

**Scaling Checklist:**
- [ ] Vercel auto-scaling enabled
- [ ] Database read replicas active
- [ ] CDN edge locations optimized
- [ ] Cache layer expanded
- [ ] Load testing after scaling

### Capacity Planning (6-month forecast)

**Current (May 2026):**
- 50,000 users
- 10,000 concurrent
- 100GB database

**Target (November 2026):**
- 500,000 users
- 50,000 concurrent
- 500GB database

**Planned Scaling:**
- Month 1: Current + 20%
- Month 2: +40%
- Month 3: +60%
- Month 4-6: +100%

---

## Team & Support Operations

### Support Triage System

**Support Email:** support@anda.africa

**Ticket Categories:**
1. **Bug Report** → Engineering team
2. **Feature Request** → Product team
3. **Usage Question** → Community moderator
4. **Account Issue** → Auth team
5. **Payment Issue** → Finance team
6. **Privacy/Security** → Security team

**Response Time Targets:**
- Critical: 1 hour
- High: 4 hours
- Medium: 24 hours
- Low: 3 days

### Moderator Operations

**Moderation Schedule (24/7 coverage)**
- 8 AM-4 PM UTC: 2 moderators
- 4 PM-12 AM UTC: 2 moderators
- 12 AM-8 AM UTC: 1 moderator + auto-filters

**Weekly Moderator Sync**
- Friday 2 PM UTC (1 hour)
- Guidelines clarity
- Training needs
- Escalations review
- Recognition of top moderators

**Escalation Path:**
```
User Report
    ↓
Auto-filter checks
    ↓
Moderator review (24 hours)
    ↓
Moderator action if needed
    ↓
User appeal (7 days)
    ↓
Team review if appealed
```

---

## Communication & Transparency

### Status Page (public.anda.africa/status)

**Shows:**
- Overall system status (Operational/Degraded/Down)
- Each service status (API, Database, Auth, etc.)
- Historical uptime (30/90/365 day view)
- Incident history
- Planned maintenance schedule

### Incident Communication

**During Incident:**
- Update status page every 15 minutes
- Email affected users
- Post in community forum
- Tweet updates

**After Incident:**
- Post-mortem blog post (48 hours)
- What happened (plain language)
- Impact (how many affected)
- Root cause
- What we're doing to prevent it

---

## Reporting & Analytics

### Daily Report (Team)
```
Date: [YYYY-MM-DD]
DAU: [X]
Assessments: [X]
Forum Posts: [X]
Uptime: [X]%
Errors: [X]
Support Tickets: [X] (avg response: Xh)
Incidents: [X] (all resolved)
Top Issue: [Description]
```

### Weekly Report (Stakeholders)
- User growth
- Feature usage
- System health
- Support summary
- Bug fixes deployed
- Planned for next week

### Monthly Report (Board/Leadership)
- User metrics & cohort analysis
- Revenue/retention KPIs
- Feature impact assessment
- Technical health score
- Community feedback summary
- Roadmap progress

---

## Disaster Recovery

### Recovery Time Objectives (RTO)
- Critical data loss: <30 minutes
- API outage: <1 hour
- Database outage: <2 hours
- Complete platform outage: <4 hours

### Backup & Restore Procedures

**Backup Strategy:**
- Real-time replication to backup database
- Daily snapshots to cloud storage
- Weekly full backup archive
- Monthly encrypted backup to offline storage

**Restore Testing:**
- Monthly test restore from backups
- Document procedures
- Train team on process
- Measure actual RTO

### Failover Procedures

**Database Failover:**
1. Detect primary failure
2. Promote read replica to primary
3. Update connection strings
4. Verify data integrity
5. Monitor for issues

---

## Tools & Access

### Essential Access
```
Vercel:       [Team dashboard]
Supabase:     [Database & auth]
Sentry:       [Error tracking]
GitHub:       [Code & CI/CD]
Slack:        [Team communication]
Email:        [support@anda.africa]
Analytics:    [GA4 dashboard]
```

### Monitoring URLs
- Vercel: vercel.com/dashboard
- Supabase: app.supabase.com
- Sentry: sentry.io/anda-platform
- Status: public.anda.africa/status
- Analytics: analytics.google.com

---

## Continuous Improvement

### Weekly Review (Friday)
- What went well?
- What could be better?
- User feedback themes?
- Quick wins implemented?

### Monthly Review
- Metrics trends
- Performance improvements made
- Security incidents (if any)
- Planned optimizations
- Team training needs

### Quarterly Review
- Major incidents analysis
- Technology improvements
- Infrastructure scaling
- Team growth planning
- Long-term roadmap alignment

---

**Status: Fully Operational**

Team trained. Systems monitoring. Ready for 10,000+ real users.
