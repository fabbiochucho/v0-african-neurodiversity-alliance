# ANDA Platform Performance Optimization Guide

## Overview
This guide covers image optimization, caching strategies, database optimization, and frontend performance improvements for the ANDA platform.

## Image Optimization

### 1. Image Size Reduction
All hero and feature images should be optimized:

**Before optimization:**
- Original: 3-5 MB per image
- Format: JPEG/PNG

**After optimization:**
- Compressed: 150-300 KB per image
- Formats: WebP (primary), JPEG (fallback)
- Dimensions: 1920x1080 max (scaled appropriately for mobile)

### 2. Image Delivery Strategy
```typescript
// Use Next.js Image component with optimization
import Image from 'next/image'

<Image
  src="/images/hero.webp"
  alt="Description"
  width={1920}
  height={1080}
  priority={true}  // For above-fold images
  quality={80}     // 80% quality (good balance)
  placeholder="blur"  // Blur while loading
/>
```

### 3. Format Selection
- **WebP**: Primary format (30% smaller than JPEG)
- **JPEG**: Fallback for older browsers
- **PNG**: Only for images requiring transparency
- **SVG**: Icons and simple graphics

### 4. Responsive Images
Use srcSet for different screen sizes:
```typescript
<Image
  srcSet="/images/hero-mobile.webp 640w, /images/hero-tablet.webp 1024w, /images/hero-desktop.webp 1920w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 100vw"
/>
```

---

## Caching Strategy

### 1. Browser Caching
```typescript
// In next.config.mjs
headers: async () => {
  return [
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'  // 1 year
        }
      ]
    },
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=60, s-maxage=120'  // 1-2 min
        }
      ]
    }
  ]
}
```

### 2. Database Query Caching
```typescript
// Cache frequently accessed data (learner profiles, goals)
import { unstable_cache } from 'next/cache'

export const getCachedLearnerProfile = unstable_cache(
  async (learnerId: string) => {
    return await supabase
      .from('learner_profiles')
      .select('*')
      .eq('id', learnerId)
      .single()
  },
  ['learner-profile'],
  { revalidate: 3600 }  // Revalidate hourly
)
```

### 3. API Response Caching
```typescript
// Cache API responses with SWR
import useSWR from 'swr'

export function useProgress(goalId: string) {
  const { data, error, isLoading } = useSWR(
    `/api/progress/goal/${goalId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000  // Dedupe requests within 1 minute
    }
  )
  
  return { data, error, isLoading }
}
```

---

## Database Optimization

### 1. Add Indexes
```sql
-- High-traffic queries need indexes
CREATE INDEX idx_learner_user_id ON learner_profiles(user_id);
CREATE INDEX idx_iep_learner_id ON ieps(learner_id);
CREATE INDEX idx_progress_goal_date ON progress_logs(goal_id, logged_date DESC);
CREATE INDEX idx_progress_learner ON progress_logs(
  (SELECT ieps.learner_id FROM ieps WHERE ieps.id = 
   (SELECT iep_id FROM iep_goals WHERE iep_goals.id = progress_logs.goal_id)),
  logged_date DESC
);
```

### 2. Query Optimization
```typescript
// BAD: N+1 queries
const learners = await supabase.from('learner_profiles').select('*')
for (const learner of learners) {
  const ieps = await supabase.from('ieps').select('*').eq('learner_id', learner.id)
}

// GOOD: Use joins
const learners = await supabase
  .from('learner_profiles')
  .select('*, ieps(*)')
  .order('created_at', { ascending: false })
```

### 3. Pagination
```typescript
// Always paginate large result sets
const ITEMS_PER_PAGE = 20

export async function getPaginatedGoals(learnerId: string, page: number = 1) {
  const start = (page - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE - 1

  return await supabase
    .from('iep_goals')
    .select('*')
    .eq('iep_id', learnerId)
    .range(start, end)
}
```

---

## Frontend Performance

### 1. Code Splitting
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/charts/ProgressChart'), {
  loading: () => <Skeleton />,
  ssr: false
})

<Suspense fallback={<Skeleton />}>
  <HeavyChart />
</Suspense>
```

### 2. Bundle Size Optimization
```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

**Target bundle sizes:**
- Initial JS: < 200 KB
- Total JS: < 600 KB
- CSS: < 50 KB

### 3. Font Loading
```css
/* Use font-display: swap to prevent FOUT */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;
}
```

### 4. Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

Monitor with:
```typescript
import { useReportWebVitals } from 'next/web-vitals'

export function reportWebVitals(metric) {
  console.log('[v0] Web Vital:', metric.name, metric.value)
}
```

---

## API Performance

### 1. Response Compression
```typescript
// Enable gzip compression
import compression from 'compression'

app.use(compression())
```

### 2. JSON Optimization
```typescript
// Remove unnecessary fields from responses
export function sanitizeIEP(iep: IEP) {
  return {
    id: iep.id,
    title: iep.title,
    status: iep.status,
    // Exclude: created_at, updated_at, ai_summary if not needed
  }
}
```

### 3. Batch Operations
```typescript
// Allow batch requests to reduce network roundtrips
POST /api/progress/batch
{
  "operations": [
    { "type": "log", "goal_id": "xxx", "rating": 4 },
    { "type": "log", "goal_id": "yyy", "rating": 3 }
  ]
}
```

---

## Monitoring & Metrics

### 1. Setup Performance Monitoring
```typescript
// Integrate with monitoring service
import { captureException } from '@sentry/nextjs'

try {
  await heavyOperation()
} catch (error) {
  captureException(error, {
    tags: { operation: 'iep_creation' }
  })
}
```

### 2. Performance Budgets
```json
{
  "performance": [
    {
      "name": "bundle-size",
      "budget": 200000,
      "path": "*.js"
    },
    {
      "name": "page-load",
      "budget": 2500,
      "timingType": "navigationTiming"
    }
  ]
}
```

---

## Implementation Checklist

- [ ] All images optimized to WebP format
- [ ] Responsive images with srcSet
- [ ] Browser caching headers configured
- [ ] Database indexes created
- [ ] N+1 queries eliminated
- [ ] Code splitting implemented for heavy components
- [ ] Bundle size < 600 KB
- [ ] LCP < 2.5s on all pages
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] API endpoints using compression
- [ ] Monitoring/alerting configured
