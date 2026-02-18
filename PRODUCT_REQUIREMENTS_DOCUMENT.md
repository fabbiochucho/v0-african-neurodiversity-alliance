# ANDA Platform - Product Requirements Document (PRD)

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Status:** MVP Specification

---

## 1. EXECUTIVE SUMMARY

### Vision Statement

The African Neurodiversity Alliance (ANDA) is a comprehensive digital platform empowering neurodivergent individuals, families, educators, and healthcare providers across Africa with self-screening tools, personalized Individualized Education Plans (IEPs), progress tracking systems, and community resources.

### Mission

To democratize neurodiversity support across Africa by providing accessible, culturally-adapted diagnostic tools and individualized education planning that respects and celebrates neurodivergent strengths while addressing specific support needs.

### Success Criteria (MVP)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Active users at launch | 100+ | Google Analytics |
| User satisfaction | 4.0+/5.0 | In-app survey |
| IEP creation completion | 80%+ | Funnel analysis |
| Payment conversion | 15%+ | Stripe/Flutterwave analytics |
| Platform uptime | 99.5% | Monitoring tools |
| Page load time | <3s | Lighthouse/WebVitals |

### Product Scope (MVP vs. Future)

**MVP Features (v1.0):**
- Self-screening assessment tool
- Personalized IEP generation
- Progress tracking and logging
- Monthly/quarterly report generation
- Subscription tiers (Free, Premium, Pro, Institutional)
- Email delivery of reports
- Community forum (basic)
- Resource directory

**Future Features (v2.0+):**
- AI-powered goal recommendations
- Therapist/educator collaboration tools
- Mobile app (iOS/Android)
- Video consultations
- Marketplace for neurodiversity resources
- Advanced analytics dashboard
- Multi-language support

---

## 2. PROBLEM STATEMENT

### Target Problem

Neurodivergent individuals in Africa (15-25% of population) lack access to:
1. **Culturally-adapted diagnostic tools** - Most screening tools are designed for Western contexts
2. **Structured education planning** - Limited access to personalized IEPs
3. **Progress tracking systems** - No integrated system to monitor growth
4. **Supportive communities** - Isolation and limited peer support
5. **Organized resources** - Scattered information about schools, therapists, accommodations

### Market Size

- **Total addressable market:** 15-25% of African population (400M+ people)
- **Initial target:** East Africa, West Africa, Southern Africa
- **User segments:**
  - Neurodivergent individuals (ages 13+)
  - Parents of neurodivergent children
  - Educators in inclusive schools
  - Healthcare providers (psychiatrists, psychologists, therapists)
  - Organizations supporting neurodiversity

### Existing Solutions

| Solution | Geographic Focus | Strengths | Gaps |
|----------|---|---|---|
| International IEP tools | North America/Europe | Comprehensive | Not Africa-adapted |
| Local NGOs | Single country | Community-rooted | No digital platform |
| Generic ed-tech | Global | Scale | No neurodiversity focus |
| ANDA | Pan-Africa | Culturally adapted | Building now |

---

## 3. SOLUTION OVERVIEW

### Core Value Propositions

1. **"Understand Yourself"** - Accessible self-screening tailored to African context
2. **"Create Your Plan"** - AI-assisted personalized education planning
3. **"Track Your Growth"** - Visual progress tracking with domain-specific insights
4. **"Connect & Learn"** - Community and resource ecosystem
5. **"Achieve Your Goals"** - Structured support leading to measurable outcomes

### Platform Architecture

```
┌─────────────────────────────────────────┐
│        ANDA Web Platform               │
│   (Next.js 14, TypeScript, React)     │
├─────────────────────────────────────────┤
│  Pages: Landing, Auth, IEP, Progress   │
│  Components: Navigation, Forms, Charts  │
├─────────────────────────────────────────┤
│     API Routes (Server-Side)           │
│  /auth, /iep, /progress, /reports      │
├─────────────────────────────────────────┤
│        Backend Services                 │
│  Supabase (Auth, DB), Flutterwave      │
│  (Payments), Resend (Email)            │
├─────────────────────────────────────────┤
│       Data Layer                        │
│  PostgreSQL (RLS, 11 tables, 50K rows) │
└─────────────────────────────────────────┘
```

### Key Features

#### 1. Self-Screening Assessment (Tier: Free)
- **Purpose:** Initial self-assessment across neurodiversity domains
- **Domains Covered:**
  - ADHD (Attention/Focus, Impulsivity, Hyperactivity)
  - Autism (Social interaction, Sensory, Repetitive patterns)
  - Dyslexia (Reading, Processing)
  - Dyscalculia (Math, Numerical reasoning)
  - Anxiety (Worry patterns, Avoidance)
  - Depression (Mood, Motivation, Sleep)
- **Output:** Domain scores, not diagnosis, with resource recommendations
- **Accessibility:** Mobile-first, clear language, support for multiple languages
- **Screening logic:** 20-30 questions per domain, adaptive branching

#### 2. IEP Generation (Tier: Premium+)
- **Inputs:** Self-screening results + manual profile info
- **Adaptive Goals:** AI-generated based on domain and user context
- **Custom Goals:** User can add personalized targets
- **Structure:**
  ```
  IEP
  ├── Learner Profile (age, context, diagnosis domains)
  ├── Summary (AI-written overview of strengths & support needs)
  ├── Goals (4-6 per domain)
  │   ├── Adaptive: Pre-generated based on domain
  │   └── Custom: User-created
  ├── Progress Timeline (3-month rolling updates)
  └── Resources (recommended supports)
  ```
- **Goal Structure:**
  - Goal description (what to achieve)
  - Domain (ADHD, Autism, etc.)
  - Target metric (measurable outcome)
  - Timeline (3/6/12 months)
  - Status (draft/active/completed)
  - Notes (context/observations)

#### 3. Progress Tracking (Tier: Free)
- **Daily Logging:** Users rate progress 1-5 for each goal
- **Weekly Summaries:** Automated calculation of progress by domain
- **Visual Dashboards:**
  - Goal-by-goal line charts
  - Domain-level progress heatmaps
  - Weekly trend analysis
  - Comparison (this week vs. last month)
- **Export:** Download progress data as CSV/PDF

#### 4. Report Generation (Tier: Premium+)
- **Monthly Reports:**
  - Summary of progress across all domains
  - Insights on trends and patterns
  - Recommended next steps
  - Celebration of wins
  - Generated HTML, email delivered
- **Quarterly Reports:**
  - Longer-term trend analysis
  - Comprehensive domain summaries
  - Stakeholder-ready format (for schools, therapists)
  - PDF export capability
- **Customizable:**
  - Report recipient (self, parent, educator, therapist)
  - Tone (formal, casual, clinical)
  - Sections included

#### 5. Resource Directory (Tier: Free)
- **Content Types:**
  - Therapists/psychologists (with credentials)
  - Educational support services
  - Assistive technology reviews
  - Accommodation guides
  - Research articles
  - Community groups
- **Search/Filter:** By location, type, language, cost
- **Community Ratings:** Users rate resources

#### 6. Community Forum (Tier: Free)
- **Discussion Categories:**
  - By neurodiversity type (ADHD, Autism, etc.)
  - By life stage (student, adult, parent)
  - By topic (accommodations, parenting, careers)
- **Moderation:** Trained moderators, community guidelines
- **Safety:** No personal diagnosis sharing, supportive tone enforced
- **Features:** Threads, upvotes, user profiles, moderation

#### 7. Subscription Management (Tier: All)
- **Plans:**
  - **Free:** Self-test, community, directory (limited)
  - **Premium ($2.99/month):** IEP creation, progress tracking, monthly reports
  - **Pro ($9.99/month):** All Premium + quarterly reports, export, analytics
  - **Institutional ($99/month):** Multiple users, team analytics, API access
- **Payment Processing:** Flutterwave (supports 60+ African payment methods)
- **Trial:** 14-day free trial on Premium/Pro
- **Cancellation:** Immediate, full refund within 7 days

#### 8. Authentication & User Management (Tier: All)
- **Sign-up Flow:**
  1. Email/password or social auth (Google, Facebook)
  2. Email verification
  3. Profile setup (name, country, language)
  4. Consent to data processing
- **Session Management:** 
  - 30-day session duration
  - Automatic token refresh
  - "Remember me" option
- **Password Recovery:** Email-based reset link
- **Account Deletion:** Data deletion within 30 days

---

## 4. USER PERSONAS & JOURNEYS

### Persona 1: Maya (28, Self-Discovered Neurodivergent)
**Profile:**
- Recently self-identified as ADHD and autistic
- Working as a teacher, struggling with productivity
- Seeking structured support and community
- Willing to pay for premium features

**Journey:**
1. Lands on homepage, reads "Why ANDA"
2. Takes free self-screening (15 min) → Gets ADHD + Autism scores
3. Signs up for Premium trial
4. Creates first IEP with custom goals (10 min)
5. Logs progress daily (2 min/day)
6. Reads monthly report, shares with therapist
7. Upgrades to Pro for export features

**Key Needs:**
- Clarity on ADHD/Autism traits
- Actionable goals
- Progress visibility
- Therapist compatibility

### Persona 2: Kwame (42, Father)
**Profile:**
- Son (9) recently diagnosed with dyslexia
- Seeking school accommodations and support
- Limited tech comfort, busy schedule
- Needs help understanding his child

**Journey:**
1. Teacher recommends ANDA
2. Creates account for family use
3. Completes dyslexia screening for his son
4. Generates IEP with educational goals
5. Shares report with school
6. Tracks son's reading progress weekly
7. Uses resource directory to find dyslexia tutor

**Key Needs:**
- Simple interface
- Educational focus
- Expert guidance
- School collaboration

### Persona 3: Asha (35, School Psychologist)
**Profile:**
- Works at inclusive school in Kenya
- Manages IEPs for 30+ neurodivergent students
- Needs efficient tools and data
- Interested in organizational subscription

**Journey:**
1. Hears about ANDA from colleague
2. Signs school up for Institutional plan
3. Creates class/group within ANDA
4. Generates IEPs for 30+ students
5. Monitors collective progress dashboard
6. Exports data for school reports
7. Uses analytics to identify training needs

**Key Needs:**
- Bulk student management
- Admin analytics
- Report generation
- Institutional integration

---

## 5. FEATURE SPECIFICATIONS

### 5.1 Self-Test Module

**User Flow:**
```
Start Test
  ↓
Select domains (multi-select)
  ↓
Answer domain-specific questions (adaptive)
  ↓
View results summary
  ↓
Optional: Create account to save results
  ↓
Receive resource recommendations
```

**Question Bank Structure:**
- 20-30 questions per domain
- Question types: Agree/Disagree (5-point scale), Multiple choice, Frequency
- Adaptive logic: Show follow-up questions based on answers
- Scoring: 0-100 scale per domain (< 30 = likely not a factor, 30-70 = possible, > 70 = likely significant)

**Results Page:**
- Bar chart of domain scores
- Written summary of each domain
- Resource recommendations based on scores
- CTA to create account

### 5.2 IEP Generator

**Algorithm:**
1. **Input Collection:**
   - Screening results
   - Learner age/grade
   - Context (school type, resources available)
   - User's stated priorities

2. **Goal Generation:**
   - Pull from ADAPTIVE_GOALS database (4 goals per domain)
   - Filter by age appropriateness
   - Rank by priority (user's stated + domain score)
   - Combine into 6-8 total goals

3. **IEP Structure:**
   ```json
   {
     "learner_id": "uuid",
     "domains": ["ADHD", "Autism"],
     "summary": "Strengths-based AI-written description",
     "goals": [
       {
         "goal_id": "uuid",
         "domain": "ADHD",
         "description": "Improve focus during classroom tasks",
         "target_metric": "Stay focused for 45 min with minimal breaks",
         "timeline": "3 months",
         "status": "active",
         "suggested_supports": [...]
       }
     ],
     "supports": "Recommended accommodations and strategies",
     "created_at": "timestamp"
   }
   ```

### 5.3 Progress Tracking UI

**Daily Logging:**
- Simple interface: List of active goals
- Rating input: 1-5 scale with emojis
- Optional notes field
- Submit button
- Confirmation message

**Weekly Dashboard:**
- 4-week line chart per goal
- Domain summary cards (avg rating, trend)
- Heatmap of domain progress
- Insights: "You're improving in ADHD focus, but struggling with social interactions"

**Export Options:**
- PDF report (formatted)
- CSV data (raw)
- Email share

### 5.4 Report Generation

**Monthly Report Template:**
```
═══════════════════════════════
   ANDA Progress Report
   Month: January 2026
═══════════════════════════════

Hello [Name],

This month you logged progress on 6 goals across 2 domains.

DOMAIN SUMMARY:
• ADHD: 72% average (↑ from 68% last month)
• Autism: 65% average (→ same as last month)

TOP IMPROVEMENTS:
1. Focus during work tasks: +15% from start of month
2. Sleep routine: +8% from start of month

AREAS TO FOCUS:
1. Social interaction: -3% from last month
2. Sensory management: stable, consider new strategies

INSIGHTS:
Based on your patterns, you seem to focus best in the
morning. Consider scheduling important tasks then.

NEXT STEPS:
1. Continue daily logging - consistency helps!
2. Try the "focus break" technique for ADHD support
3. Reach out to community about social interaction

Keep celebrating your wins! 🎉
ANDA Support Team
```

---

## 6. DATA MODELS

### Core Entities

**Users (Supabase Auth)**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY (auth.users.id),
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  country TEXT,
  language VARCHAR(5),
  role VARCHAR(20), -- 'user', 'educator', 'therapist'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Learner Profiles**
```sql
CREATE TABLE learner_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  age INTEGER,
  country TEXT,
  diagnosis_domains JSONB, -- ["ADHD", "Autism"]
  created_at TIMESTAMP
);
```

**IEPs**
```sql
CREATE TABLE ieps (
  id UUID PRIMARY KEY,
  learner_id UUID REFERENCES learner_profiles(id),
  created_by UUID REFERENCES profiles(id),
  title TEXT,
  status VARCHAR(20), -- 'draft', 'active', 'completed'
  summary TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Goals**
```sql
CREATE TABLE iep_goals (
  id UUID PRIMARY KEY,
  iep_id UUID REFERENCES ieps(id),
  goal_text TEXT NOT NULL,
  domain VARCHAR(50),
  target_metric TEXT,
  status VARCHAR(20),
  target_date DATE,
  created_at TIMESTAMP
);
```

**Progress Logs**
```sql
CREATE TABLE progress_logs (
  id UUID PRIMARY KEY,
  goal_id UUID REFERENCES iep_goals(id),
  logged_by UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  logged_date DATE,
  created_at TIMESTAMP
);
```

---

## 7. API ENDPOINTS

### Authentication

```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/reset-password
```

### IEP Management

```
GET    /api/iep/learner
POST   /api/iep/create
GET    /api/iep/{id}
PUT    /api/iep/{id}
DELETE /api/iep/{id}
POST   /api/iep/{id}/goals
PUT    /api/iep/goals/{goalId}
DELETE /api/iep/goals/{goalId}
```

### Progress Tracking

```
POST   /api/progress/log
GET    /api/progress/goal/{goalId}
GET    /api/progress/summary/{learnerId}
GET    /api/progress/learner/{learnerId}
GET    /api/progress/weekly/{learnerId}
```

### Reports

```
POST   /api/reports/generate
GET    /api/reports/{reportId}
POST   /api/reports/send-email
GET    /api/reports/list/{learnerId}
```

### Payments

```
POST   /api/payments/initialize
GET    /api/payments/verify
GET    /api/payments/status/{transactionId}
POST   /api/subscriptions/cancel
```

### Resources

```
GET    /api/resources/directory
GET    /api/resources/search
POST   /api/resources/rate/{resourceId}
```

---

## 8. ACCEPTANCE CRITERIA

### Feature: Self-Test Assessment

**Scenario 1: User Completes Test**
```
Given: User on self-test landing page
When: User selects domains and answers all questions
Then: 
  - Results calculated correctly per domain
  - Summary page displays domain scores
  - Resources recommended based on scores
  - User can save results (requires signup)
```

**Scenario 2: Partial Completion**
```
Given: User on question 15 of 30
When: User closes browser
Then:
  - Progress saved if logged in
  - User can resume from same point
  - If not logged in, progress lost (shows message)
```

### Feature: IEP Generation

**Scenario 1: Create New IEP**
```
Given: Logged-in user with screening results
When: User clicks "Create IEP" → Confirms learner info → Generates
Then:
  - IEP created with 6-8 goals
  - Goals are from ADAPTIVE_GOALS database
  - User can edit all goals
  - User can add custom goals
  - IEP saved to database
  - User can download/email as PDF
```

### Feature: Progress Tracking

**Scenario 1: Log Daily Progress**
```
Given: User with active IEP
When: User clicks "Log Progress" → Rates each goal → Submits
Then:
  - Progress saved to database
  - Confirmation message shown
  - Dashboard updates immediately
  - Entry timestamp recorded
```

---

## 9. WIREFRAMES & USER INTERFACE

### Key Pages

**1. Landing Page**
- Hero: "Empower Neurodivergent Africans"
- CTA buttons: "Take Self-Test" | "Explore Resources"
- Features section: Self-Test, IEP, Tracking, Community
- Social proof: User testimonials, statistics
- Footer: Links, contact, social media

**2. Self-Test Results**
- Bar chart of domain scores
- Domain descriptions
- Recommended resources
- CTA: "Create Account to Save"

**3. IEP Dashboard**
- List of all IEPs
- Create new IEP button
- Filter by status
- Click to view/edit

**4. IEP Editor**
- Learner info (editable)
- Goals list (add/edit/remove)
- Generate report button
- Save/publish options

**5. Progress Tracking**
- Quick-log interface (rate each goal)
- Weekly chart
- Domain summary cards
- Export button

**6. Reports**
- Report list
- View HTML report
- Download PDF
- Email report

---

## 10. TECHNICAL SPECIFICATIONS

### Tech Stack

| Layer | Technology |
|-------|---|
| Frontend | Next.js 14.2, React 18, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Payments | Flutterwave |
| Email | Resend |
| Hosting | Vercel |
| Analytics | Vercel Analytics |
| Error Tracking | Sentry |

### Performance Targets

| Metric | Target |
|--------|--------|
| FCP (First Contentful Paint) | < 1.5s |
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTI (Time to Interactive) | < 3.5s |
| API Response Time | < 500ms |
| Database Query Time | < 100ms |

### Security Requirements

- HTTPS only (Vercel automatic)
- CSRF tokens on state-changing requests
- Input validation on all API endpoints
- Rate limiting (10 requests/min per user)
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping + DOMPurify for UGC)
- Password hashing (bcrypt, minimum 10 rounds)
- Session timeout (30 days)
- 2FA support (future)

### Scalability

- Supabase handles up to 1M concurrent connections
- Vercel auto-scales API routes
- CDN caching for static assets
- Database replication (future) for redundancy
- Estimated capacity: 100K active users at launch

---

## 11. DEPENDENCIES & INTEGRATIONS

### External Services

1. **Supabase**
   - Authentication
   - PostgreSQL database
   - Row-level security
   - Realtime subscriptions (future)

2. **Flutterwave**
   - Payment processing
   - 60+ African payment methods
   - Webhook for transaction status

3. **Resend**
   - Transactional emails
   - Report delivery
   - User notifications

4. **Vercel**
   - Hosting
   - Serverless functions
   - Analytics
   - Environment management

5. **Google Analytics** (future)
   - User behavior tracking
   - Conversion funnel analysis
   - Cohort analysis

---

## 12. SUCCESS METRICS & KPIs

### Engagement Metrics

| KPI | Target | Method |
|-----|--------|--------|
| Daily Active Users | 50+ | Google Analytics |
| Weekly Test Completions | 100+ | Database query |
| IEP Creation Rate | 20%+ of users | Funnel analysis |
| Daily Progress Logs | 500+ | Database metrics |
| Forum Activity | 50+ posts/week | Database query |

### Business Metrics

| KPI | Target | Method |
|-----|--------|--------|
| Premium Conversion | 15%+ | Payment processor |
| Monthly Recurring Revenue | $5K+ | Stripe/Flutterwave |
| Churn Rate | < 5%/month | Subscription data |
| Customer Acquisition Cost | < $5 | Marketing analysis |
| Lifetime Value | > $100 | Cohort analysis |

### Quality Metrics

| KPI | Target | Method |
|-----|--------|--------|
| Uptime | 99.5%+ | Monitoring service |
| Page Load Time | < 3s | Lighthouse |
| Test Coverage | 60%+ | Jest coverage report |
| Bug Report Rate | < 1/week | GitHub Issues |
| User Satisfaction | 4.0+/5.0 | In-app survey |

---

## 13. ROADMAP

### Phase 1: MVP (Current - Q1 2026)
- Self-test assessment
- IEP generation & management
- Progress tracking
- Basic reports
- Free + Premium tiers

### Phase 2: Enhancement (Q2 2026)
- AI-powered goal recommendations
- Advanced analytics dashboard
- Therapist/educator collaboration
- API for partners
- Mobile-responsive optimization

### Phase 3: Expansion (Q3-Q4 2026)
- Mobile app (iOS/Android)
- Video consultations
- Multi-language support
- Advanced moderation in community
- Research partnerships

### Phase 4: Ecosystem (2027)
- Resource marketplace
- Institutional partnerships
- Government integration
- Regional expansion
- Mobile-first features

---

## 14. RISK & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|---|---|---|
| Supabase service outage | Low | High | Backup database strategy, monitoring |
| User data breach | Low | Critical | Encryption, regular security audits |
| Low adoption | Medium | High | User testing, marketing strategy |
| Payment processor issues | Low | Medium | Fallback to Stripe (future) |
| Regulatory changes | Medium | Medium | Legal review, compliance team |
| Churn of early users | Medium | Medium | Improve UX, user support |

---

## 15. APPENDIX

### A. Glossary

| Term | Definition |
|------|---|
| Neurodivergent | Person whose brain develops or functions differently than typical |
| IEP | Individualized Education Plan - personalized education goals |
| Adaptive Goals | Pre-generated goals based on screening results |
| Custom Goals | User-created personalized goals |
| Domain | Category of neurodivergence (ADHD, Autism, etc.) |
| RLS | Row-Level Security - database security at row level |

### B. Success Story Example

**Before ANDA:**
- Jamal (24, ADHD) struggled with focus and organization
- No structured plan, constant frustration
- Couldn't explain ADHD needs to employer

**With ANDA:**
- Takes self-test → Confirms ADHD diagnosis
- Creates IEP with focus-related goals
- Logs progress daily → sees 30% improvement in 3 months
- Shares report with HR → Gets workplace accommodations
- Joins community → Finds peer support

**Result:**
- Career advancement, mental health improvement, community belonging

---

**Document prepared by:** v0 AI Assistant  
**For:** ANDA Leadership & Stakeholders  
**Contact:** [Project Owner Email]  
**Next Review Date:** Q2 2026 Post-Launch
