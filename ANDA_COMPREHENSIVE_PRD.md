# African Neurodiversity Alliance (ANDA) - Comprehensive Product Requirements Document

## Document Control

**Product:** African Neurodiversity Alliance (ANDA) Platform  
**Version:** 1.0  
**Status:** FINAL  
**Date:** May 21, 2026  
**Audience:** Product Team, Engineering Team, Stakeholders  
**Document Type:** Master PRD (combines vision, features, technical specs, and roadmap)

---

## 1. EXECUTIVE SUMMARY

### Product Vision
ANDA is a comprehensive, Africa-focused digital platform empowering neurodivergent individuals (people with autism, ADHD, dyslexia, and other neurodevelopmental differences) and their support ecosystems through:

- **Personalized Assessment** - 155-question multi-domain self-assessment tool
- **IEP Generation** - AI-powered Individual Education Plan creation with PDF export
- **Progress Tracking** - Daily logging system with analytics and milestone tracking
- **Community Support** - Peer-to-peer forum with 10 support categories
- **Resource Directory** - Practitioners, support groups, organizations database
- **Learning Platform** - Courses and certifications for families and professionals
- **Tools Repository** - 130+ curated assistive technology recommendations
- **Advocacy Hub** - Campaign tracking and civic engagement platform

### Why This Problem Matters

**Problem Statement:**
- 15-20% of the global population is neurodivergent
- In Africa: Limited awareness, diagnosis, and support infrastructure
- Gap: No centralized, Africa-appropriate resource platform
- Impact: Neurodivergent individuals face educational, employment, and health barriers

**Solution:**
ANDA removes barriers by providing:
1. Evidence-based self-assessment
2. Personalized support plans
3. Peer community
4. Professional resources
5. Advocacy tools

**Market Opportunity:**
- Target: 500M+ Africans (1 in 5 are neurodivergent)
- Countries: Nigeria, Kenya, South Africa, Ghana, Egypt (Phase 1)
- TAM: $1.2B+ (education, healthcare, assistive tech combined)

### Success Metrics

| Metric | Year 1 Target | Year 2 Target |
|--------|---------------|---------------|
| Users | 50,000 | 500,000 |
| Assessments Completed | 25,000 | 250,000 |
| IEPs Generated | 10,000 | 100,000 |
| Forum Threads | 5,000 | 50,000 |
| Community Members | 20,000 | 200,000 |
| Countries | 5 | 10 |
| Revenue | $100K | $1M |

---

## 2. PRODUCT OVERVIEW

### Core Value Propositions

#### For Individuals (Self-Advocates)
- **Self-Discovery** - Understand your neurodivergence through evidence-based assessment
- **Personalized Guidance** - AI-powered recommendations tailored to your profile
- **Community Support** - Connect with others on similar journeys
- **Resource Access** - Find local practitioners, services, and assistive tools
- **Progress Tracking** - Visualize growth and celebrate wins
- **Advocacy Power** - Participate in policy and cultural change campaigns

#### For Families & Caregivers
- **Understanding** - Learn about neurodiversity through curated courses
- **Planning** - Generate comprehensive IEPs for educational planning
- **Support** - Join parent communities and peer support groups
- **Resources** - Find schools, therapists, and local services
- **Advocacy** - Engage in campaigns improving accessibility and inclusion
- **Tracking** - Monitor and record progress across domains

#### For Educators & Professionals
- **Assessment Tools** - Evidence-based diagnostic support materials
- **IEP Management** - Streamlined collaborative IEP creation and tracking
- **Professional Development** - Certification courses and continuing education
- **Community** - Network with other specialists
- **Resource Sharing** - Access research and best practices
- **Impact Tracking** - Measure outcomes across student populations

#### For Healthcare Providers
- **Clinical Insights** - Comprehensive assessment results with recommendations
- **Patient Resources** - Shareable recommendations and action plans
- **Research Access** - Population data and outcome tracking
- **Referral Network** - Connect with specialists across Africa
- **Continuing Education** - Latest research and diagnostic protocols
- **Patient Engagement** - Monitor adherence and progress

---

## 3. DETAILED FEATURE SPECIFICATION

### 3.1 Self-Assessment Tool

**Purpose:** Provide evidence-based screening across 6 neurodevelopmental domains

**Specifications:**
- **155 Questions** across 6 domains:
  1. Autism Spectrum Traits (30 questions)
  2. ADHD Traits (30 questions)
  3. Dyslexia Indicators (20 questions)
  4. Dyscalculia Markers (15 questions)
  5. Dysgraphia & Processing (15 questions)
  6. Sensory & Motor Profiles (25 questions)

- **User Flow:**
  1. Answer questions (randomized per session)
  2. Self-rate on 4-point Likert scale
  3. Receive instant results with:
     - Domain scores (percentile ranking)
     - Trait profiles (strong/typical/developing)
     - Personalized narrative summary
     - Evidence-based interpretation
  4. Download PDF report
  5. Optional: Save results for tracking

- **Scoring Algorithm:**
  - Domain aggregation: Average Likert responses
  - Percentile calculation: Compare to 10,000+ user baseline
  - Profile generation: Trait clustering algorithm
  - Narrative generation: AI-powered (Claude/GPT)

- **Data Storage:**
  - Store in `assessment_responses` table
  - Link to user profile
  - Allow multiple attempts (track progression)
  - Export as PDF for records/sharing

### 3.2 IEP Generation System

**Purpose:** Create personalized, AI-assisted Individual Education Plans

**Specifications:**
- **Input Collection:**
  1. User profile (name, age, domain)
  2. Assessment results (auto-populated if available)
  3. Goals (selected from 1000+ adaptive goal library)
  4. Timeline (short-term: 3 months, long-term: 12 months)

- **IEP Components:**
  1. Executive summary (AI-generated)
  2. Assessment results and interpretation
  3. Strengths and challenges
  4. Learning style preferences
  5. Accommodations and modifications
  6. SMART goals (3-5 per domain)
  7. Progress monitoring plan
  8. Parent/teacher roles
  9. Resource recommendations
  10. Review and evaluation schedule

- **AI Features:**
  - Goal suggestion based on profile
  - Accommodation recommendations from research database
  - Timeline estimation based on domain and complexity
  - Resource matching (connect to local services)

- **Export Formats:**
  - PDF (printable, shareable)
  - Editable Google Docs template
  - Importable to school systems (when applicable)

- **Database:**
  - `ieps` table (master IEP records)
  - `iep_goals` table (individual goals)
  - `iep_accommodations` table (access modifications)
  - `iep_reviews` table (audit trail)

### 3.3 Progress Tracking System

**Purpose:** Monitor growth and achievement across domains over time

**Specifications:**
- **Logging Features:**
  - Daily check-ins (quick 2-minute logs)
  - Weekly reviews (structured reflection)
  - Monthly reports (automated analytics)
  - Domain-specific trackers (goal-linked)

- **Metrics Tracked:**
  - Goal progress (0-100% completion)
  - Behavioral changes (frequency tracking)
  - Skill development (milestone-based)
  - Well-being indicators (mood, stress, sleep)
  - Medication/intervention effects (if applicable)

- **Analytics:**
  - Progress charts (line graphs by domain)
  - Trend analysis (week-over-week, month-over-month)
  - Milestone achievements (celebrations)
  - Goal completion rate
  - Behavioral patterns (AI-identified)

- **Reporting:**
  - Weekly summary email
  - Monthly PDF report (shareable)
  - Annual progress report
  - Exportable data (CSV for clinical use)

- **Database:**
  - `progress_logs` table (daily entries)
  - `progress_milestones` table (achievements)
  - `progress_metrics` table (aggregated analytics)

### 3.4 Community Forum

**Purpose:** Peer-to-peer support across 10 categories

**Specifications:**
- **10 Categories:**
  1. General Support & Introductions
  2. Autism Spectrum Community
  3. ADHD Support
  4. Dyslexia & Learning Differences
  5. Parents & Caregivers
  6. Educators & School
  7. Employment & Career
  8. Health & Wellness
  9. Advocacy & Rights
  10. Success Stories & Celebrations

- **Features:**
  - Threaded discussions (unlimited replies)
  - Likes and reactions (emoji support)
  - Search across all content
  - Moderation tools (flag, report, review queue)
  - User profiles with badges (expert, contributor, etc.)
  - Pinned important threads
  - Category-specific guidelines

- **Moderation:**
  - Community guidelines (harm, spam, misinformation)
  - Automated flagging (content analysis)
  - Human review queue (50 moderators)
  - User warnings and suspensions
  - Appeal process

- **Safety Features:**
  - Anonymous posting option
  - Content moderation AI
  - Crisis resource links (mental health hotlines)
  - Community standards enforcement
  - Privacy controls (thread visibility)

- **Database:**
  - `forum_categories` table
  - `forum_threads` table
  - `forum_posts` table
  - `forum_likes` table
  - `forum_moderation_actions` table

### 3.5 ANDA Directory (Practitioners & Organizations)

**Purpose:** Searchable database of 1000+ verified professionals and services

**Specifications:**
- **Directory Types:**
  1. Individual practitioners (psychologists, educators, therapists)
  2. Support groups (peer-led, professional-facilitated)
  3. Schools (inclusive, special education, mainstream)
  4. Healthcare facilities (clinics, hospitals, telemedicine)
  5. Organizations (NGOs, advocacy groups, research centers)

- **Information Captured:**
  - Name, credentials, specialization
  - Location (country, city, address)
  - Languages spoken
  - Services offered
  - Cost/pricing information
  - Availability (hours, telehealth?)
  - Contact info (phone, email, website)
  - User reviews (5-star + text)
  - Certifications/accreditations

- **Search & Filter:**
  - By type (practitioner, organization, service)
  - By domain (Autism, ADHD, etc.)
  - By location (country, city, distance)
  - By service (assessment, therapy, coaching)
  - By availability (in-person, online, both)
  - By cost (free, low-cost, standard, premium)

- **Verification:**
  - Admin manual verification (credentials checked)
  - Community reviews (trust signals)
  - Annual re-verification
  - User feedback reporting

- **Database:**
  - `directory_entries` table (1000+ records)
  - `directory_reviews` table
  - `directory_categories` table (type/service)
  - `directory_locations` table (geographic indexing)

### 3.6 ANDA Learning (Courses & Certifications)

**Purpose:** Provide 50+ courses on neurodiversity topics

**Specifications:**
- **Course Catalog (50+ courses):**
  1. **Foundational** (12 courses)
     - Intro to Neurodiversity
     - Understanding Autism, ADHD, Dyslexia
     - African Context & Challenges
     - Diagnostic Pathways

  2. **For Parents** (12 courses)
     - Supporting Your Neurodivergent Child
     - Educational Planning (IEPs)
     - Home Strategies & Accommodations
     - Self-Care for Caregivers

  3. **For Educators** (12 courses)
     - Inclusive Classroom Strategies
     - Differentiated Instruction
     - Assistive Technology
     - Behavior Support Techniques

  4. **For Professionals** (10 courses)
     - Advanced Diagnosis & Assessment
     - Treatment & Intervention
     - Research & Evidence
     - Ethical Practice

  5. **Advanced Topics** (4 courses)
     - Intersectionality & Neurodiversity
     - Advocacy & Policy
     - Workplace Accommodations
     - Lifespan Development

- **Course Structure:**
  - 5-20 hours per course (self-paced)
  - Video lessons, readings, interactive activities
  - Quizzes and assessments
  - Final project or exam
  - Certificate of completion

- **Certification Tracks:**
  - **Community Educator** (3 courses, 15 hours)
  - **Professional Certificate** (8 courses, 60 hours)
  - **Advanced Specialist** (15 courses, 120 hours)

- **Pricing:**
  - Free: Intro and community courses
  - $50-150: Professional certificate courses
  - Scholarships available (20% of seats)

- **Database:**
  - `courses` table
  - `course_modules` table
  - `course_enrollments` table
  - `course_completions` table (certificates)

### 3.7 ANDA Tools Repository

**Purpose:** Curated recommendations for 130+ assistive technologies

**Specifications:**
- **App Categories (6 main, 20+ sub):**
  1. **Communication** (20 apps)
     - AAC apps (Proloquo2Go, JABtalk)
     - Speech-to-text (Google Docs, Otter.ai)
     - Social communication (Otsimo, Predictable)

  2. **Learning & Literacy** (25 apps)
     - Dyslexia support (Ghotit, ReadSpeaker)
     - Math tools (Desmos, Photomath)
     - Study aids (Notion, Anki, Quizlet)

  3. **Sensory & Regulation** (15 apps)
     - Sensory tools (Bubble, Sensory Sensations)
     - Meditation (Calm, Insight Timer)
     - Sound tools (myNoise, CalmRadio)

  4. **Organization & Productivity** (20 apps)
     - Task management (Todoist, Trello, Monday)
     - Calendar & scheduling (Google Cal, Fantastical)
     - Note-taking (OneNote, Bear)

  5. **Social & Emotional** (25 apps)
     - Social stories (Pixicles)
     - Emotion tracking (Moodpath, Moodsmith)
     - Video modeling (Clarkie)

  6. **Wellness & Health** (25 apps)
     - Fitness (Fitbit, Strava)
     - Sleep (Sleep Cycle, Pillow)
     - Mental health (Headspace, MindShift)

- **For Each App:**
  - Name, category, platform
  - Price and subscription model
  - Key features (5-10 bullets)
  - Accessibility rating (1-5)
  - User reviews (ANDA community)
  - Similar alternatives
  - Tutorial links
  - Pricing comparison

- **Search & Recommend:**
  - Filter by category, price, platform
  - Smart recommendations based on profile
  - Comparison tool (side-by-side features)
  - Discount codes and educational pricing

- **Database:**
  - `tools_apps` table (130+ records)
  - `tools_categories` table
  - `tools_reviews` table
  - `tools_recommendations` table (user history)

### 3.8 ANDA Advocacy Hub

**Purpose:** Track and engage in 10+ active campaigns for policy change

**Specifications:**
- **Campaigns (Active & Planned):**
  1. **Nigeria:** Inclusive education bill
  2. **Kenya:** Neurodiversity in workplace rights
  3. **South Africa:** Healthcare access expansion
  4. **Ghana:** Teacher training mandate
  5. **Egypt:** Disability rights strengthening
  6. **Africa-wide:** Continental neurodiversity charter

- **For Each Campaign:**
  - Goal and impact (what policy change?)
  - Current status (draft, in discussion, passed)
  - Actions needed (sign petition, contact rep, donate)
  - Progress tracker (signatures, donations, responses)
  - Key dates and deadlines
  - Educational resources

- **Engagement Features:**
  - Sign petition (collect signatures)
  - Contact representative (pre-filled letters)
  - Share on social media
  - Donate (link to payment)
  - Volunteer to help (skill-based opportunities)
  - Track your impact (personal dashboard)

- **Tracking:**
  - Campaign progress visualization
  - Signature counter and goal
  - Media coverage highlights
  - Success stories and outcomes
  - Newsletter updates

- **Database:**
  - `advocacy_campaigns` table
  - `advocacy_actions` table (sign, donate, volunteer)
  - `advocacy_supporters` table
  - `advocacy_metrics` table (real-time stats)

---

## 4. TECHNICAL SPECIFICATIONS

### 4.1 Technology Stack

**Frontend:**
- Framework: Next.js 14 (App Router)
- UI Library: React 18
- Styling: Tailwind CSS v4
- Components: shadcn/ui (50+ components)
- Forms: react-hook-form + Zod validation
- Icons: Lucide React (50+ icons)
- Charts: Recharts for analytics

**Backend:**
- Runtime: Node.js (via Next.js API routes)
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth (JWT)
- File Storage: Vercel Blob
- Payments: Flutterwave (African payment processor)
- Email: SendGrid (transactional)
- Analytics: Vercel Analytics + custom tracking

**Infrastructure:**
- Hosting: Vercel (serverless)
- CDN: Vercel Edge Network
- Domain: neurodiversityalliance.vercel.app
- Monitoring: Sentry (error tracking)
- CI/CD: GitHub Actions

**Development Tools:**
- Version Control: Git/GitHub
- Testing: Vitest + React Testing Library
- Linting: ESLint
- Code Formatting: Prettier

### 4.2 Database Schema (Summary)

**12 Tables with RLS:**

1. `auth.users` - Supabase managed
2. `profiles` - User accounts (roles, preferences)
3. `organizations` - Multi-tenant support
4. `assessments` - Assessment sessions
5. `assessment_responses` - Question answers
6. `ieps` - IEP documents
7. `iep_goals` - Goal tracking
8. `progress_logs` - Daily logging
9. `progress_metrics` - Aggregated analytics
10. `forum_categories` - 10 discussion categories
11. `forum_threads` - Discussion threads
12. `forum_posts` - Thread replies
13. `forum_likes` - Engagement metrics
14. `resources` - Directory entries
15. `resource_reviews` - User feedback
16. `courses` - Learning content
17. `course_enrollments` - Student progress
18. `payments` - Transaction history

**Key Design Principles:**
- RLS on all user data tables
- Soft deletes for compliance
- Audit timestamps on modifications
- Foreign key constraints enforced
- Indexes on frequently queried columns

### 4.3 API Specifications (Summary)

**29 Production Endpoints:**

| Domain | Endpoints | Purpose |
|--------|-----------|---------|
| Assessment | 4 | Start, answer, complete, results |
| IEP | 4 | Create, retrieve, update, list |
| Progress | 3 | Log, retrieve, summary |
| Reports | 3 | Generate, retrieve, email |
| Payments | 2 | Initialize, verify (Flutterwave) |
| Forum | 6 | Categories, threads, posts, likes, search, moderation |
| Resources | 5 | List, details, search, reviews, favorites |
| Neurafiki | 1 | Recommendations (parent education) |

**API Patterns:**
- RESTful design
- JSON request/response
- Error codes: 200, 201, 400, 401, 403, 404, 500
- Rate limiting: 100-1000 requests/min per endpoint
- CORS: Enabled for https://neurodiversityalliance.vercel.app
- Authentication: Bearer token (JWT)

### 4.4 Security & Compliance

**Security Measures:**
- HTTPS enforcement (production only)
- JWT-based authentication
- Row-Level Security (RLS) on all data
- Input validation (Zod schemas)
- XSS prevention (React escaping)
- CSRF protection (token validation)
- Rate limiting per endpoint
- Audit logging (timestamps, user tracking)

**Compliance:**
- GDPR compliance (data export, deletion)
- CCPA-ready (privacy controls)
- HIPAA considerations (health data handling)
- PIPEDA (for Canadian users if expanded)
- Local data residency (Africa-based servers)

**Data Protection:**
- Encryption at rest (Supabase managed)
- Encryption in transit (TLS 1.3)
- Sensitive data in environment variables
- No hardcoded secrets
- Regular security audits planned

---

## 5. USER PERSONAS & JOURNEYS

### 5.1 Core Personas

#### Persona 1: Kayla (Parent in Nigeria)
- Age: 42
- Child: 8-year-old with suspected autism
- Pain: Limited diagnosis options in Nigeria, doesn't know how to support child
- Goal: Understand child's needs, find local support
- Primary Features: Assessment, IEP generation, Directory, Learning
- Frequency: 3-4x per week

#### Persona 2: Marcus (Self-Advocate in South Africa)
- Age: 24
- Condition: Recently diagnosed with ADHD
- Pain: Feels isolated, unsure of next steps
- Goal: Connect with others, find strategies for work
- Primary Features: Self-assessment, Community Forum, Tools, Learning
- Frequency: Daily

#### Persona 3: Dr. Amara (Educator in Kenya)
- Age: 38
- Role: Special education teacher
- Pain: Limited resources for inclusive classrooms
- Goal: Professional development, access to best practices
- Primary Features: Learning platform, Directory, Tools, IEP collaboration
- Frequency: Weekly

#### Persona 4: Dr. Okonkwo (Psychologist in Ghana)
- Age: 55
- Role: Clinical psychologist
- Pain: Disconnected from peer network, hard to refer patients to services
- Goal: Network with professionals, clinical resources
- Primary Features: Professional community, IEP tools, Directory listings
- Frequency: 2-3x per week

---

## 6. PRODUCT ROADMAP

### Phase 1: MVP Launch (COMPLETED - May 2026)
**Features:**
- Self-assessment tool (155 questions)
- IEP generation and management
- Progress tracking system
- Community forum (10 categories)
- Directory (practitioners, services)
- Learning platform (20+ courses)
- Tools repository (130+ apps)
- Advocacy hub (6 campaigns)
- Neurafiki parent education integration

**Status:** ✅ LIVE

### Phase 2: Expansion (June-August 2026)
**Features:**
- Expanded directory (500+ → 2000+ listings)
- Advanced analytics dashboard
- Mobile app (iOS, Android)
- Multilingual support (Swahili, French, Arabic)
- Advanced IEP customization
- Outcome tracking and research database
- Partnership integrations (schools, clinics)

**Owner:** Product + Engineering

### Phase 3: AI & Personalization (September-December 2026)
**Features:**
- AI-powered personalized recommendations
- Chatbot for common questions
- Predictive analytics (identify at-risk users)
- Adaptive learning paths
- Personalized resource matching
- Outcome prediction models

**Owner:** AI/ML team

### Phase 4: Expansion (Year 2)
**Features:**
- Expand to 20+ African countries
- Telehealth integration (video assessments)
- Healthcare provider EMR integration
- School system integrations
- Employer partnerships (workplace accommodations)
- Government data sharing (policy impact)

---

## 7. SUCCESS CRITERIA & METRICS

### Key Performance Indicators (KPIs)

**Growth Metrics:**
- Monthly active users (MAU)
- Weekly active users (WAU)
- User acquisition cost (CAC)
- Retention rate (30-day, 90-day)
- Net Promoter Score (NPS) target: 50+

**Engagement Metrics:**
- Assessments completed per month
- IEPs generated per month
- Forum activity (posts per day)
- Course completion rate (50%+ target)
- Time spent on platform (avg session length)

**Impact Metrics:**
- Number of lives improved (user self-report)
- Resources accessed per user
- Professional referrals made
- Advocacy campaign signatures
- Policy changes influenced

**Financial Metrics:**
- Monthly recurring revenue (MRR)
- Average revenue per user (ARPU)
- Churn rate (< 5% monthly target)
- Customer lifetime value (CLV)

**Quality Metrics:**
- App uptime (99.5%+ target)
- Page load time (< 2 seconds)
- API response time (< 200ms median)
- Error rate (< 0.5%)
- Test coverage (80%+ target)

---

## 8. GO-TO-MARKET STRATEGY

### Target Markets (Phase 1)
1. **Nigeria** (30M neurodivergent population)
2. **Kenya** (6M neurodivergent population)
3. **South Africa** (8M neurodivergent population)
4. **Ghana** (5M neurodivergent population)
5. **Egypt** (12M neurodivergent population)

### Marketing Channels
1. **Digital**: Social media (Facebook, Instagram, TikTok), Google Ads
2. **Partnerships**: Schools, clinics, NGOs, support groups
3. **PR**: Stories, research publications, media coverage
4. **Community**: Grassroots organizing, ambassador program
5. **Events**: Webinars, workshops, awareness campaigns

### Pricing Model
- **Free Tier**: Assessment, basic IEP, forum access
- **Premium**: $5-15/month (full features, advanced analytics)
- **Professional**: $50-100/month (clinic/school licenses)
- **Enterprise**: Custom pricing (government, health systems)

---

## 9. RISK MANAGEMENT

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Database performance degradation | Medium | High | Add caching, optimize queries, scale infrastructure |
| API rate limiting issues | Low | Medium | Implement comprehensive rate limiting, monitor closely |
| Authentication bypass vulnerabilities | Low | Critical | Security audit, penetration testing, bug bounty |
| Data loss or corruption | Low | Critical | Automated backups, disaster recovery plan |

### Product Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Low user adoption | Medium | High | Strong community focus, user research, iterate |
| Feature parity with competitors | Medium | Medium | Differentiate on community and Africa-focus |
| Cultural/language barriers | High | Medium | Multilingual support, cultural advisors |
| Privacy concerns (sensitive data) | Medium | High | Privacy-first design, transparent policies, compliance |

### Business Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Insufficient funding | Low | Critical | Diversify revenue streams, seek grants |
| Regulatory barriers in countries | Medium | High | Legal consultation, government partnerships |
| Competition from international players | High | Medium | Focus on community, localization, partnerships |
| Churn due to usability issues | Medium | Medium | Continuous UX testing, user feedback loops |

---

## 10. APPENDICES

### A. Glossary
- **Neurodivergent:** Natural variation in neurological development (autism, ADHD, dyslexia, etc.)
- **IEP:** Individual Education Plan - customized support document
- **RLS:** Row-Level Security - database access control
- **JWT:** JSON Web Token - authentication mechanism
- **Flutterwave:** African payment processor

### B. Competitive Analysis
- **Woebot** (mental health chatbot) - no neurodiversity focus
- **Understood.org** (learning disabilities) - US-focused
- **Specialty Corp** (HR tools) - enterprise-only
- **ANDA Advantage:** Africa-specific, comprehensive, community-driven

### C. References & Resources
- CDC Autism Statistics
- WHO Neurodevelopmental Guidelines
- African Union Health Policy
- UNESCO Inclusive Education Framework
- Global Neurodiversity Awareness Month (October)

### D. Contact Information
- **Product Lead:** [TBD]
- **Engineering Lead:** [TBD]
- **Community Lead:** [TBD]
- **Support Email:** support@anda.africa

---

**PRD Version History:**
- v1.0 (May 21, 2026) - Initial comprehensive PRD

**Approval Status:**
- [ ] Product Manager
- [ ] Engineering Lead
- [ ] Executive Sponsor
- [ ] Board Review

---

**End of PRD**
