# ANDA New Pages - Testing Guide

## Quick Access URLs

### User Pages
| Page | URL | Role |
|------|-----|------|
| Dashboard | `/dashboard` | All authenticated users |
| My Profile | `/profile` | All authenticated users |
| Settings | `/settings` | All authenticated users |
| Progress Tracking | `/progress` | Parents, Advocates, Educators |
| My Courses | `/my-courses` | All authenticated users |
| My Resources | `/my-resources` | All authenticated users |
| My Community | `/my-community` | All authenticated users |
| IEP Dashboard | `/iep/dashboard` | Parents, Educators, Practitioners |

### Admin/Moderator Pages
| Page | URL | Role |
|------|-----|------|
| Admin Dashboard | `/admin/dashboard` | Administrators |
| Moderator Dashboard | `/moderator/dashboard` | Moderators |

---

## Testing Scenarios

### 1. Dashboard Page (`/dashboard`)
**What to Test:**
- [ ] All 5 quick stat cards display correctly
- [ ] 6 main action cards appear and are clickable
- [ ] Recent activity timeline shows sample data
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Color scheme matches ANDA branding
- [ ] All icons render properly

**Expected Results:**
- Dashboard loads with user's current stats
- Clicking action cards navigates to correct pages
- Activity shows realistic recent actions

---

### 2. Profile Page (`/profile`)
**What to Test:**
- [ ] Profile picture avatar displays
- [ ] All form fields populate with sample data
- [ ] Edit button toggles edit mode
- [ ] Can edit all fields when in edit mode
- [ ] Save button appears in edit mode
- [ ] Avatar change button works
- [ ] Password change button functional
- [ ] 2FA toggle works
- [ ] Session management button works
- [ ] Delete account warning displays correctly

**Expected Results:**
- Profile information is editable
- All security features are accessible
- Edit mode properly enables/disables fields

---

### 3. Settings Page (`/settings`)
**What to Test:**
- [ ] Three tabs appear: Notifications, Privacy, Appearance
- [ ] All toggle switches work
- [ ] Notification preferences are saveable
- [ ] Privacy options are configurable
- [ ] Language and theme options display
- [ ] Download data button is visible
- [ ] Delete account button is accessible

**Expected Results:**
- Settings save successfully
- Tabs switch content properly
- All toggles respond to clicks

---

### 4. Progress Tracking Page (`/progress`)
**What to Test:**
- [ ] 4 stats cards display correctly (daily entries, weekly avg, monthly avg, streak)
- [ ] Three tabs work: Daily Log, Weekly Summary, Monthly Report
- [ ] Daily log shows sample entries with edit buttons
- [ ] Weekly summary shows 7-day visualization
- [ ] Monthly report download button works
- [ ] IEP Goals section shows progress bars
- [ ] Goal completion percentages display

**Expected Results:**
- All tabs load without errors
- Progress bars animate smoothly
- Sample data is realistic

---

### 5. My Courses Page (`/my-courses`)
**What to Test:**
- [ ] In Progress tab shows courses with completion percentage
- [ ] Completed tab shows courses with certificate button
- [ ] Wishlist tab shows empty state
- [ ] Progress bars show correct fill percentage
- [ ] Course statistics display (3 cards at bottom)
- [ ] Continue/Review buttons navigate correctly
- [ ] Certificate button is available for completed courses

**Expected Results:**
- All tabs display correct course data
- Stats cards calculate correctly
- Buttons navigate to course pages

---

### 6. My Resources Page (`/my-resources`)
**What to Test:**
- [ ] Saved tab shows bookmarked resources
- [ ] Resource cards display title, category, type, rating
- [ ] Star rating displays correctly (5-star scale)
- [ ] Recommended tab shows personalized suggestions
- [ ] Collections tab shows resource collections
- [ ] Bookmark button toggles on/off
- [ ] View Details button navigates correctly

**Expected Results:**
- Resources load with full information
- Ratings display as filled stars
- Bookmark button updates state

---

### 7. My Community Page (`/my-community`)
**What to Test:**
- [ ] Groups tab shows joined communities
- [ ] Community activity feed displays
- [ ] My Posts tab shows user's discussions
- [ ] Bookmarks tab shows saved discussions
- [ ] Member count displays per group
- [ ] Like and reply counts show
- [ ] View Group button navigates
- [ ] Activity notifications display

**Expected Results:**
- All community data loads
- Activity feed is chronological
- Stats are accurate

---

### 8. IEP Dashboard (`/iep/dashboard`)
**What to Test:**
- [ ] All active IEPs display in list
- [ ] IEP cards show title, dates, status
- [ ] Progress bars show correctly
- [ ] Status badges are color-coded
- [ ] Goal count displays per IEP
- [ ] View and Export PDF buttons work
- [ ] Create New IEP button visible and clickable
- [ ] Stats cards show total/active/average progress

**Expected Results:**
- IEP list loads with all details
- Progress bars fill correctly
- Buttons navigate to appropriate pages

---

### 9. Admin Dashboard (`/admin/dashboard`)
**What to Test:**
- [ ] 4 key metric cards display
- [ ] User count shows correct number
- [ ] Active today calculation is accurate
- [ ] System uptime percentage displays
- [ ] API health indicator shows status
- [ ] 4 tabs load: Overview, Users, Moderation, Reports
- [ ] User management table displays sample users
- [ ] Moderation queue shows flagged items
- [ ] Report generation buttons are visible

**Expected Results:**
- Metrics load and display correctly
- All admin functions accessible
- No errors on tab switching

---

### 10. Moderator Dashboard (`/moderator/dashboard`)
**What to Test:**
- [ ] 4 stat cards display (flagged items, reviewed, actions, response time)
- [ ] Review queue shows flagged content
- [ ] Severity levels are color-coded
- [ ] Report count and author information display
- [ ] Review/Delete/Warn/Approve buttons present
- [ ] Guidelines tab shows all rules
- [ ] Actions log displays moderation history
- [ ] Time-based ordering is correct

**Expected Results:**
- Flagged items load in review queue
- All action buttons are functional
- Guidelines display clearly

---

## Navigation Testing

### Desktop Navigation
- [ ] Account dropdown appears in desktop nav
- [ ] Dropdown shows all 8+ user pages
- [ ] Clicking items navigates correctly
- [ ] Menu closes after selection

### Mobile Navigation
- [ ] Mobile menu includes all pages
- [ ] "My Account" section organized
- [ ] All links navigate correctly
- [ ] Menu closes on link click

---

## Design & UX Testing

### Visual Consistency
- [ ] All pages use Poppins font
- [ ] Color scheme consistent (#3C9C87, #FFC857, #0081A7)
- [ ] Spacing matches design system
- [ ] Icons from Icons library are consistent
- [ ] No broken images or missing assets

### Responsive Design
- [ ] Mobile (320px): All pages stack vertically
- [ ] Tablet (768px): 2-column layouts work
- [ ] Desktop (1024px+): Full multi-column layouts display
- [ ] No horizontal scrolling on any breakpoint

### Accessibility
- [ ] All buttons have hover states
- [ ] Form inputs are properly labeled
- [ ] Color contrast meets WCAG standards
- [ ] Keyboard navigation works throughout
- [ ] No missing alt text for images

---

## Data Validation Testing

### Sample Data Fields
- [ ] Stats calculations are accurate
- [ ] Dates format correctly
- [ ] Numbers display with proper formatting
- [ ] Progress percentages are 0-100
- [ ] No console errors

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Performance Testing

### Page Load
- [ ] Dashboard loads in <2s
- [ ] Large list pages load in <3s
- [ ] No layout shift when content loads
- [ ] Smooth scrolling without jank

### Interactions
- [ ] Tab switching is instant
- [ ] Button clicks respond immediately
- [ ] Form inputs are responsive
- [ ] Dropdowns open without delay

---

## Integration Testing

### Navigation Flow
- [ ] Can navigate from dashboard to all pages
- [ ] Back button works correctly
- [ ] Breadcrumbs display (if implemented)
- [ ] Deep linking works

### Feature Integration
- [ ] Edit buttons properly enable edit mode
- [ ] Save buttons update state
- [ ] Delete buttons show confirmations
- [ ] Filters work if implemented

---

## Known Limitations (Pre-API Integration)

1. **Mock Data Only** - All stats and content are hardcoded samples
2. **No Authentication Check** - Pages accessible without login in dev mode
3. **No Data Persistence** - Changes not saved (localStorage or API)
4. **No Real-time Updates** - Activity feeds are static
5. **No File Uploads** - Avatar/document uploads not functional
6. **No PDF Export** - Export buttons don't generate files yet

---

## Next Steps

1. **Connect APIs** - Integrate backend endpoints for dynamic data
2. **Add Authentication** - Implement role-based access control
3. **Enable Data Persistence** - Connect to Supabase
4. **Add Validations** - Form validation and error handling
5. **Implement Actions** - Make buttons actually perform operations
6. **Add Notifications** - Toast/notification system for actions
7. **Testing** - Unit, integration, and E2E tests

---

## Support

- **Issues?** Check browser console for errors
- **Questions?** Refer to COMPLETE_PAGES_SUMMARY.md
- **API Integration?** See app/api/ folder for existing patterns
- **Styling?** Check globals.css for design tokens

---

## Quick Testing Checklist

- [ ] All 10 pages load without errors
- [ ] Navigation works between pages
- [ ] Responsive design works on 3+ screen sizes
- [ ] No missing icons or images
- [ ] Color scheme consistent throughout
- [ ] Forms are editable (profile, settings)
- [ ] Tabs switch content properly
- [ ] Stats display realistic numbers
- [ ] Buttons are clickable and styled
- [ ] Mobile menu includes all pages

**Ready to test!** Visit each URL and follow the test scenarios above.
