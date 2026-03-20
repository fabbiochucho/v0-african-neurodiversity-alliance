# ANDA Platform Implementation Checklist - Week 1

## Database Migrations (Execute in order)

### ✅ Already Created
- [x] 001_create_profiles.sql - User profiles
- [x] 002_create_organizations.sql - Institution management
- [x] 003_create_iep_tables.sql - IEP core tables
- [x] 004_create_progress_tables.sql - Progress tracking
- [x] 005_create_reports_tables.sql - Report generation
- [x] 006_create_payments_tables.sql - Subscription management
- [x] 007_create_profile_trigger.sql - Auto profile creation

### ⬜ NEW - EXECUTE IN SUPABASE DASHBOARD
1. **008_create_community_tables.sql** - Forum infrastructure
   ```bash
   # Run in Supabase SQL Editor
   # Tables: forum_categories, forum_threads, forum_posts, forum_post_likes, forum_moderation
   # Creates 6 tables with RLS policies
   # Time: ~2 minutes
   ```
   
2. **009_create_resources_tables.sql** - Resource directory
   ```bash
   # Tables: resource_categories, resources, resource_reviews, resource_favorites
   # Creates 4 tables with verification workflow
   # Time: ~2 minutes
   ```
   
3. **010_create_assessment_tables.sql** - Assessment data system
   ```bash
   # Tables: assessment_questions, assessment_options, assessments, assessment_responses, domain_scores
   # Creates 5 tables for storing assessment data
   # Time: ~2 minutes
   ```

### Execution Instructions
1. Go to Supabase Dashboard → Project → SQL Editor
2. Create new query
3. Copy-paste entire content of each SQL file
4. Click "Run" 
5. Verify "Query successful" message
6. Move to next file

---

## Backend API Endpoints - Priority Implementation

### PHASE 1A: Assessment System (Week 1, 12 hours)

#### Endpoint 1: POST `/api/assessments`
**Purpose:** Start new assessment
**Status:** ❌ TODO
**File:** `app/api/assessments/route.ts`

```typescript
// Handler must:
- Authenticate user
- Create assessment record in DB
- Set completion to false
- Return assessment_id for frontend
- Validate user has paid tier if restricted
```

#### Endpoint 2: POST `/api/assessments/[id]/response`
**Purpose:** Record single answer
**Status:** ❌ TODO
**File:** `app/api/assessments/[id]/response/route.ts`

```typescript
// Handler must:
- Validate assessment belongs to user
- Record response with option selection
- Update progress_percentage
- Calculate running domain scores
- Return updated progress
```

#### Endpoint 3: POST `/api/assessments/[id]/complete`
**Purpose:** Finalize assessment
**Status:** ❌ TODO
**File:** `app/api/assessments/[id]/complete/route.ts`

```typescript
// Handler must:
- Mark assessment as completed
- Calculate final domain scores
- Generate interpretation (low/moderate/high/very_high)
- Link to learner profile if exists
- Generate recommendations
- Return full results
```

#### Endpoint 4: GET `/api/assessments/[id]/results`
**Purpose:** Get assessment results & insights
**Status:** ❌ TODO
**File:** `app/api/assessments/[id]/results/route.ts`

```typescript
// Handler must:
- Validate user owns assessment
- Return domain scores
- Return percentile rankings
- Return text interpretations
- Return personalized recommendations
```

---

### PHASE 1B: Forum System (Week 2-3, 24 hours)

#### Forum Categories
**Endpoint:** GET `/api/forum/categories`
**File:** `app/api/forum/categories/route.ts`
**Status:** ❌ TODO

Categories to pre-populate:
1. General Discussion
2. Parents & Caregivers
3. Educators & School Support
4. Self-Advocacy & Independence
5. Neurodiversity Pride
6. Resources & Recommendations
7. Success Stories
8. Policy & Systems Change

#### Create Thread
**Endpoint:** POST `/api/forum/threads`
**File:** `app/api/forum/threads/route.ts`
**Status:** ❌ TODO

```typescript
// Must validate:
- User authenticated
- Category exists
- Title not empty (3-200 chars)
- Content not empty (10+ chars)
- Create slug from title
// Must include:
- User IP for spam detection
- Sanitize HTML content
- Auto-generate excerpt (150 chars)
```

#### Get Threads
**Endpoint:** GET `/api/forum/threads?category=X&page=Y`
**File:** `app/api/forum/threads/route.ts`
**Status:** ❌ TODO

```typescript
// Must return:
- Paginated threads (10 per page)
- Thread stats (views, replies, last activity)
- Moderator list for thread
- Author info (name, avatar, post count)
```

#### Create Post/Reply
**Endpoint:** POST `/api/forum/posts`
**File:** `app/api/forum/posts/route.ts`
**Status:** ❌ TODO

```typescript
// Must validate:
- Thread exists and not locked
- Content not empty (5+ chars)
- Rate limit: max 10 posts/hour per user
- Sanitize HTML
// Must include:
- Parent post reference (for nested)
- Auto-increment replies_count on thread
```

#### Like Post
**Endpoint:** POST `/api/forum/posts/[id]/like`
**File:** `app/api/forum/posts/[id]/like/route.ts`
**Status:** ❌ TODO

```typescript
// Must:
- Toggle like for authenticated user
- Update likes_count on post
- Check for existing like record
- Return updated count
```

---

### PHASE 1C: Resource Directory (Week 3-4, 18 hours)

#### Create Resource
**Endpoint:** POST `/api/resources`
**File:** `app/api/resources/route.ts`
**Status:** ❌ TODO

```typescript
// Validate:
- Name, description required
- Type must be valid
- Email/phone/website at least one
- Set status to "pending" (needs verification)
- Create by current user

// Send to moderation queue
```

#### Get Resources with Filters
**Endpoint:** GET `/api/resources?type=X&country=Y&language=Z&rating=4`
**File:** `app/api/resources/route.ts`
**Status:** ❌ TODO

```typescript
// Must support filters:
- type: therapist, school, support_group, etc.
- country: Nigeria, Kenya, Egypt, etc.
- language: en, es, fr, sw, yo
- cost_range: free, low, medium, high
- verified: true/false
- rating: min 1-5 stars
// Must return:
- Paginated results (20 per page)
- Sort options: rating, newest, most_reviewed
```

#### Add Review
**Endpoint:** POST `/api/resources/[id]/reviews`
**File:** `app/api/resources/[id]/reviews/route.ts`
**Status:** ❌ TODO

```typescript
// Validate:
- User not already reviewed this resource
- Rating 1-5
- Max 2 reviews per user per resource per 30 days
// Must:
- Calculate new avg_rating
- Increment review_count
- Mark user as verified if used resource
```

#### Save Favorite
**Endpoint:** POST `/api/resources/[id]/favorites`
**File:** `app/api/resources/[id]/favorites/route.ts`
**Status:** ❌ TODO

```typescript
// Toggle favorite for user
// Return favorite status
```

---

## Frontend Component Updates

### Assessment System Integration
**File:** `app/self-test/page.tsx`
**Changes:**
- [ ] Call `/api/assessments` on start → get assessment_id
- [ ] On each question: POST to `/api/assessments/[id]/response`
- [ ] On complete: POST to `/api/assessments/[id]/complete`
- [ ] Show results from `/api/assessments/[id]/results`
- [ ] Remove mock data, use real data from DB

### Forum Frontend
**Files:** `app/community/page.tsx` + new components
**Components Needed:**
- [ ] `components/forum/CategoryList.tsx`
- [ ] `components/forum/ThreadList.tsx`
- [ ] `components/forum/ThreadDetail.tsx`
- [ ] `components/forum/PostCard.tsx`
- [ ] `components/forum/ReplyForm.tsx`
- [ ] `components/forum/ModerationPanel.tsx`

**Changes:**
- [ ] Replace mock data with API calls
- [ ] Add pagination
- [ ] Add thread creation form
- [ ] Add post reply interface
- [ ] Add like/helpful buttons
- [ ] Add moderation tools

### Resource Directory Frontend
**File:** `app/directory/page.tsx` + new components
**Components Needed:**
- [ ] `components/directory/ResourceCard.tsx`
- [ ] `components/directory/SearchBar.tsx`
- [ ] `components/directory/FilterPanel.tsx`
- [ ] `components/directory/ReviewForm.tsx`
- [ ] `components/directory/ResourceDetail.tsx`

**Changes:**
- [ ] Replace mock data with API calls
- [ ] Implement advanced filtering
- [ ] Add resource submission form
- [ ] Add review system
- [ ] Add favorites management
- [ ] Add map view

---

## Content & Data Seed

### Assessment Questions
**Action:** Populate `assessment_questions` table
**File:** `scripts/011_seed_assessment_questions.sql` (CREATE)
**Data Needed:**
- 20-30 questions per domain (6 domains = 150-180 questions)
- Age groups: child (6-12), teen (13-17), adult (18+)
- Languages: en, es, fr, sw, yo
- Cultural context annotations
- Sample response options (1-5 scoring)

**Estimated Time:** 40 hours (professional neurodiversity experts)
**Cost:** $3-5K

### Forum Initial Content
**Action:** Create initial discussion threads
**Data to Seed:**
- [ ] 5 pinned threads (community guidelines, introductions, FAQs)
- [ ] 50 starter threads across categories
- [ ] 500 sample posts/replies
- [ ] Verified user badges for expert posts

**Estimated Time:** 16 hours
**Cost:** $1.5K

### Resource Directory Initial Data
**Action:** Add 500+ verified resources
**Data Needed:**
- [ ] 100+ therapists & psychologists (with credentials)
- [ ] 150+ schools & educational services
- [ ] 100+ NGOs & support organizations
- [ ] 50+ research organizations
- [ ] Verified and approved status

**Estimated Time:** 32 hours (research + verification)
**Cost:** $2.5K

---

## Testing Requirements

### Unit Tests
**Files to Create:**
- [ ] `__tests__/api/assessments.test.ts`
- [ ] `__tests__/api/forum.test.ts`
- [ ] `__tests__/api/resources.test.ts`

**Test Coverage:**
- [ ] Authentication checks
- [ ] Input validation
- [ ] Database operations
- [ ] Error handling
- [ ] Rate limiting

### E2E Tests
**Files to Create:**
- [ ] `__tests__/e2e/assessment-flow.test.ts`
- [ ] `__tests__/e2e/forum-flow.test.ts`
- [ ] `__tests__/e2e/directory-flow.test.ts`

**Flows to Test:**
- [ ] Complete assessment → get results → use insights
- [ ] Create thread → reply → moderate
- [ ] Search resources → add review → save favorite

### Performance Tests
- [ ] API response times < 500ms
- [ ] Page loads < 3s
- [ ] Forum searches < 1s
- [ ] Assessment completion < 2s per question

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (100% coverage for critical paths)
- [ ] Database migrations verified in staging
- [ ] API endpoints tested with real data
- [ ] Security scan passed (OWASP Top 10)
- [ ] Performance benchmarks met
- [ ] Accessibility audit (WCAG AA)

### Production Deployment
- [ ] Enable database backups
- [ ] Configure monitoring/alerting
- [ ] Set up error tracking (Sentry/Datadog)
- [ ] Configure rate limiting
- [ ] Enable RLS on all tables
- [ ] Set environment variables

### Post-Deployment
- [ ] Monitor error rates (< 0.1%)
- [ ] Monitor response times
- [ ] Monitor database performance
- [ ] User acceptance testing
- [ ] Smoke tests on all flows

---

## Team Assignments (Suggested)

| Task | Owner | Hours | Week |
|------|-------|-------|------|
| Assessment API | Hamid | 12 | 1 |
| Assessment Migration | Hamid | 2 | 1 |
| Assessment Tests | Amara | 6 | 1 |
| Assessment Frontend | (Hire) | 8 | 1 |
| Forum APIs | Sarah | 16 | 2-3 |
| Forum Migration | Sarah | 2 | 2 |
| Forum Frontend | (Hire) | 20 | 2-3 |
| Resources APIs | Amara | 12 | 3-4 |
| Resources Migration | Amara | 2 | 3 |
| Resources Frontend | (Hire) | 16 | 3-4 |

**Total Week 1 Development:** 50 hours
**Total Week 1 Budget:** $10K (labor) + $4K (tools/content)

---

## Success Metrics (Week 1)

| Metric | Target | Success |
|--------|--------|---------|
| DB Migrations | 3/3 executed | ✅ |
| Assessment APIs | 4/4 built | ❌ In progress |
| Assessment Tests | 12+ tests | ❌ In progress |
| Forum Categories | 8 seeded | ❌ Todo |
| Forum Creation | Working | ❌ Todo |
| Resources Imported | 100+ | ❌ Todo |
| Test Coverage | 85%+ | ❌ In progress |
| Performance | < 500ms API | ❌ In progress |

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| DB migration fails | CRITICAL | Test in staging first, have rollback plan |
| API performance slow | HIGH | Add indexes, implement caching, optimize queries |
| Forum spam | HIGH | Rate limiting, content filters, moderation queue |
| Assessment data leaks | CRITICAL | Ensure RLS policies work, audit access logs |
| Team burnout | HIGH | Realistic timeline, clear priorities, support |

---

## Next Review: 7 days

**Checkpoint:** Assess progress on all items. Adjust priorities if needed. Celebrate wins. Address blockers.
