# Teacher Profile Feature - Quick Start Guide

## Prerequisites

Ensure you have:
- Node.js installed
- PostgreSQL database running
- Environment variables configured in `.env.local`

## Setup Steps

### 1. Install Dependencies

The `date-fns` package has already been added to your project:

```bash
npm install
```

### 2. Configure Environment

Ensure your `.env.local` has:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# PostgreSQL Database
DATABASE_URL=postgresql://user:password@host:port/database

# Optional: Site URL for share functionality
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Push Database Schema

```bash
npm run db:push
```

This creates the `teachers` and `reviews` tables in your database.

### 4. Seed Sample Data

```bash
npm run db:seed
```

This adds:
- 3 teachers
- 16 reviews with diverse ratings

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Viewing Teacher Profiles

After seeding, you can view:

- **Dr. Sarah Johnson (Computer Science)**: http://localhost:3000/teachers/1
  - 6 reviews (mostly 4-5 stars, one 3-star)

- **Prof. Michael Chen (Mathematics)**: http://localhost:3000/teachers/2
  - 5 reviews (mostly 5 stars, one 2-star)

- **Ms. Emily Davis (English Literature)**: http://localhost:3000/teachers/3
  - 5 reviews (varied ratings including one 1-star)

## Testing Features

### 1. Test Review Sorting

1. Navigate to any teacher profile
2. Click the "Sort by:" dropdown
3. Try each option:
   - **Most Recent** - Newest reviews first
   - **Highest Rated** - 5-star reviews first
   - **Lowest Rated** - 1-star reviews first

### 2. Test Share Functionality

1. Click the "Share" button in the hero section
2. On mobile: Native share sheet should appear
3. On desktop: Link copied to clipboard, "Copied!" feedback shown

### 3. Test Responsive Design

1. Resize your browser window
2. Observe layout changes:
   - **Mobile** (< 640px): Single column, stacked elements
   - **Tablet** (640px - 1024px): Two-column grid
   - **Desktop** (> 1024px): Three-column layout with sidebar

### 4. Test Loading State

1. Add artificial delay in page.tsx (optional):
```typescript
await new Promise(resolve => setTimeout(resolve, 2000));
```
2. Refresh page - should see loading skeleton

### 5. Test 404 Page

1. Navigate to http://localhost:3000/teachers/999
2. Should see custom "Teacher Not Found" page
3. Test action buttons (Go Home, Search Teachers)

### 6. Test Empty Reviews State

1. Create a new teacher without reviews:
```bash
# Using Drizzle Studio
npm run db:studio
```
2. Navigate to the new teacher's profile
3. Should see "No reviews yet" empty state

## Component Usage Examples

### Using RatingDistribution

```tsx
import RatingDistribution from "@/components/teachers/rating-distribution";

<RatingDistribution
  ratingCounts={{
    5: 10,
    4: 5,
    3: 2,
    2: 1,
    1: 0
  }}
  totalReviews={18}
/>
```

### Using ReviewCard

```tsx
import ReviewCard from "@/components/reviews/review-card";

<ReviewCard
  rating={5}
  comment="Excellent teacher!"
  reviewerName="John Doe"
  createdAt={new Date()}
/>
```

### Using Breadcrumb

```tsx
import Breadcrumb from "@/components/ui/breadcrumb";

// Light variant (for dark backgrounds)
<Breadcrumb
  variant="light"
  items={[
    { label: "Home", href: "/" },
    { label: "Teachers", href: "/teachers" },
    { label: "Dr. Smith" }
  ]}
/>

// Dark variant (default, for light backgrounds)
<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Current Page" }
  ]}
/>
```

### Using ShareButton

```tsx
import ShareButton from "@/components/ui/share-button";

<ShareButton
  url="https://example.com/teachers/1"
  title="Check out this teacher!"
/>
```

## Build for Production

```bash
# Create production build
npm run build

# Start production server
npm run start
```

## Troubleshooting

### Issue: Teacher profile shows 404 but database has data

**Solution:**
1. Check database connection: `npm run db:studio`
2. Verify environment variables in `.env.local`
3. Ensure Supabase credentials are correct

### Issue: Reviews not sorting

**Solution:**
1. Check browser console for errors
2. Ensure ReviewList component is client-side (`"use client"`)
3. Verify review data structure matches types

### Issue: Share button not working

**Solution:**
1. For clipboard: Ensure HTTPS or localhost
2. Check browser console for permissions errors
3. Test on different browsers/devices

### Issue: Build fails

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Issue: Date formatting shows incorrect time

**Solution:**
1. Verify `date-fns` is installed: `npm list date-fns`
2. Check review `created_at` field has valid ISO date string
3. Ensure timezone is correct in database

## File Paths Reference

All file paths are absolute from project root:

```
/Users/yee/hello-world/
├── app/teachers/[id]/page.tsx
├── components/teachers/rating-distribution.tsx
├── components/reviews/review-card.tsx
├── components/reviews/review-list.tsx
├── components/reviews/review-sort.tsx
├── components/ui/breadcrumb.tsx
├── components/ui/share-button.tsx
└── lib/utils/teacher-stats.ts
```

## Next Steps

1. **Build Review Submission Page**: Create `/app/teachers/[id]/review/page.tsx`
2. **Add Review Form**: Form with star rating input and comment textarea
3. **Implement Authentication**: Add user authentication for submitting reviews
4. **Add Moderation**: Review approval system
5. **Implement Search**: Full-text search for teachers
6. **Add Filters**: Filter by department, subject, rating
7. **Create Dashboard**: Admin dashboard for managing reviews

## Additional Resources

- [Full Feature Documentation](/Users/yee/hello-world/docs/TEACHER_PROFILE_FEATURE.md)
- [Component Tree](/Users/yee/hello-world/docs/COMPONENT_TREE.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For issues or questions:
1. Check documentation files in `/docs`
2. Review component source code
3. Check database schema in `/db/schema.ts`
4. Verify environment configuration

---

**Production Ready**: All components are type-safe, accessible, responsive, and optimized for SEO and performance.
