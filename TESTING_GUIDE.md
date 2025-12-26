# Testing Guide - API Migration

## Current Status

### Frontend Implementation: ✅ Complete
- API client created and working
- Home page migrated to use Java API
- Teacher profile page migrated to use Java API
- Error handling implemented and tested
- TypeScript type checking passes
- ESLint passes for new code

### Backend Status: ⚠️ Needs Fix
The Java Spring Boot API has a PostgreSQL prepared statement issue with Supabase's connection pooler.

**Error:** `ERROR: prepared statement "S_1" already exists`

## Local Testing

### Prerequisites
```bash
cd /Users/yee/hello-world
npm install
```

### 1. Start Development Server
```bash
npm run dev
# Server will run on http://localhost:3001 (or 3000 if available)
```

### 2. Expected Behavior (Current State)

#### Home Page - http://localhost:3001
**With Backend Issue:**
- ✅ Page loads successfully
- ✅ Shows "No Teachers Yet" state
- ✅ Stats show 0 teachers and 0 reviews
- ✅ Error is logged to console: "Failed to fetch stats"
- ✅ No crashes or infinite loops

**When Backend is Fixed:**
- Page will show actual teacher count
- Featured teachers grid will display recently reviewed teachers
- All stats will be accurate

#### Teacher Profile Page - http://localhost:3001/teachers/1
**With Backend Issue:**
- Page shows 404 Not Found (expected, as API call fails)

**When Backend is Fixed:**
- Teacher details will display
- Reviews will be shown with rating distribution
- Share and review buttons will work

### 3. Manual API Testing

Test API endpoints directly:

```bash
# Health check (working)
curl https://rate-my-teacher-api.fly.dev/api/health

# Teachers endpoint (currently failing)
curl https://rate-my-teacher-api.fly.dev/api/teachers

# Specific teacher (currently failing)
curl https://rate-my-teacher-api.fly.dev/api/teachers/1

# Reviews (currently failing)
curl https://rate-my-teacher-api.fly.dev/api/reviews
```

### 4. Code Quality Checks

```bash
# TypeScript type checking
npx tsc --noEmit
# Should complete without errors ✅

# ESLint
npm run lint
# New files pass linting ✅
```

## Testing Checklist (After Backend Fix)

### Home Page Tests
- [ ] Stats show correct teacher and review counts
- [ ] Recently reviewed teachers display in grid (max 6)
- [ ] Each teacher card shows:
  - [ ] Teacher name and subject
  - [ ] Department (if available)
  - [ ] Average rating with stars
  - [ ] Review count
- [ ] Click on teacher card navigates to profile page
- [ ] Search bar is visible and functional

### Teacher Profile Page Tests
- [ ] Teacher details display correctly:
  - [ ] Name, subject, department
  - [ ] Avatar with initials
  - [ ] Overall rating
  - [ ] Review count
- [ ] Breadcrumb navigation works
- [ ] Share button functions
- [ ] Rating distribution shows correctly
- [ ] Reviews list displays:
  - [ ] All reviews for the teacher
  - [ ] Sorting works (Recent, Highest, Lowest)
  - [ ] Each review shows rating, comment, reviewer name, date
- [ ] "Write a Review" button visible (bottom right)

### Error Handling Tests
- [ ] Invalid teacher ID shows 404 page
- [ ] Network errors handled gracefully
- [ ] Page never crashes from API errors
- [ ] User sees appropriate error messages

### Performance Tests
- [ ] Initial page load < 2 seconds
- [ ] No console errors in production build
- [ ] Images load properly
- [ ] Animations are smooth

## Test Data Requirements

Ensure the database has:
- At least 10 teachers
- At least 50 reviews across multiple teachers
- Teachers with varying rating distributions (1-5 stars)
- Teachers with and without departments

## Environment Variables

Verify these are set in `/Users/yee/hello-world/.env.local`:

```env
NEXT_PUBLIC_API_URL="https://rate-my-teacher-api.fly.dev"
```

For local backend testing, you can change to:
```env
NEXT_PUBLIC_API_URL="http://localhost:8080"
```

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

## Mobile Testing

Test responsive design:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet view

## Debugging Tips

### Frontend Debugging

**Check API calls:**
```typescript
// Add to lib/api/client.ts for debugging
console.log('API Request:', endpoint);
console.log('API Response:', response.status);
```

**Check Network tab:**
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Refresh page
5. Check requests to rate-my-teacher-api.fly.dev

**Check Console tab:**
- Look for "Failed to fetch" messages
- Check for ApiError logs
- Verify error handling is working

### Backend Debugging

**Check Fly.io logs:**
```bash
fly logs -a rate-my-teacher-api
```

**Check health endpoint:**
```bash
curl https://rate-my-teacher-api.fly.dev/api/health
```

**Restart backend:**
```bash
fly apps restart rate-my-teacher-api
```

## Known Issues

### 1. Backend Prepared Statement Error
**Impact:** All API calls fail with 500 error
**Workaround:** None for frontend
**Fix Required:** Backend configuration change (see API_MIGRATION_SUMMARY.md)

### 2. Port 3000 in Use
**Impact:** Dev server runs on port 3001
**Workaround:** Use http://localhost:3001
**Fix:** Kill process on port 3000 or use the alternate port

## Success Criteria

Frontend migration is complete when:
- ✅ All code compiles without TypeScript errors
- ✅ ESLint passes for new code
- ✅ Error handling prevents crashes
- ✅ UI/UX unchanged from original
- ⏳ All API calls work (pending backend fix)

## Next Steps

1. **Backend Team:** Fix PostgreSQL prepared statement issue
2. **Test:** Run through testing checklist
3. **Deploy:** Once all tests pass, deploy to production
4. **Monitor:** Watch for errors in production logs

## Support

For issues or questions:
- Check `/Users/yee/hello-world/API_MIGRATION_SUMMARY.md`
- Review code in `/Users/yee/hello-world/lib/api/`
- Check Fly.io logs for backend errors
