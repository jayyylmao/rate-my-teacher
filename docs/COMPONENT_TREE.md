# Teacher Profile Component Tree

## Component Hierarchy

```
/app/teachers/[id]/page.tsx (Server Component)
│
├─ <Breadcrumb variant="light" />
│  └─ /components/ui/breadcrumb.tsx
│
├─ <ShareButton />
│  └─ /components/ui/share-button.tsx (Client)
│
├─ <StarRating size="lg" />
│  └─ /components/ui/star-rating.tsx
│
├─ <RatingDistribution />
│  └─ /components/teachers/rating-distribution.tsx
│
└─ <ReviewList reviews={reviews} /> (Client)
   └─ /components/reviews/review-list.tsx
      │
      ├─ <ReviewSort onSortChange={setSortOption} />
      │  └─ /components/reviews/review-sort.tsx (Client)
      │
      └─ <ReviewCard /> (multiple)
         └─ /components/reviews/review-card.tsx
            └─ <StarRating size="sm" />
```

## Page States

### Loading State
```
/app/teachers/[id]/loading.tsx
└─ Skeleton UI with animated placeholders
```

### Not Found State
```
/app/teachers/[id]/not-found.tsx
└─ Custom 404 page with action buttons
```

## Data Flow

```
┌─────────────────────────────────────────────────┐
│ Server Component: page.tsx                      │
│                                                 │
│ 1. Fetch data from Supabase                    │
│    - Teacher info                               │
│    - All reviews                                │
│                                                 │
│ 2. Calculate statistics                         │
│    - Average rating                             │
│    - Rating counts (5★, 4★, 3★, 2★, 1★)       │
│                                                 │
│ 3. Pass data to components                      │
└────────────────┬────────────────────────────────┘
                 │
                 ├──────────────────────────────────┐
                 │                                  │
                 ▼                                  ▼
    ┌─────────────────────┐         ┌─────────────────────────┐
    │ RatingDistribution  │         │ ReviewList (Client)     │
    │ (Server)            │         │                         │
    │ - Display bars      │         │ 1. Manage sort state    │
    │ - Show percentages  │         │ 2. Sort reviews         │
    └─────────────────────┘         │ 3. Render cards         │
                                    └────────┬────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │ ReviewCard      │
                                    │ (Multiple)      │
                                    │ - Star rating   │
                                    │ - Comment       │
                                    │ - Date (ago)    │
                                    └─────────────────┘
```

## File Organization

```
/Users/yee/hello-world/
│
├── app/
│   └── teachers/
│       └── [id]/
│           ├── page.tsx         # Main profile page (Server)
│           ├── loading.tsx      # Loading skeleton
│           └── not-found.tsx    # 404 page
│
├── components/
│   ├── teachers/
│   │   ├── rating-distribution.tsx  # Rating bars
│   │   └── teacher-card.tsx        # Existing card component
│   │
│   ├── reviews/
│   │   ├── review-card.tsx     # Individual review
│   │   ├── review-list.tsx     # Review list with sorting (Client)
│   │   └── review-sort.tsx     # Sort dropdown (Client)
│   │
│   └── ui/
│       ├── breadcrumb.tsx      # Navigation breadcrumb
│       ├── share-button.tsx    # Share/copy button (Client)
│       ├── star-rating.tsx     # Existing star component
│       ├── button.tsx          # Existing button component
│       └── card.tsx            # Existing card component
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts           # Server-side Supabase client
│   │   └── client.ts           # Client-side Supabase client
│   │
│   ├── utils/
│   │   └── teacher-stats.ts    # Statistics utilities
│   │
│   └── types/
│       └── database.ts         # TypeScript types
│
├── db/
│   ├── schema.ts               # Database schema
│   ├── index.ts                # Database client
│   └── seed.ts                 # Enhanced seed data (16 reviews)
│
└── docs/
    ├── TEACHER_PROFILE_FEATURE.md   # Full documentation
    └── COMPONENT_TREE.md            # This file
```

## Client vs Server Components

### Server Components (Default)
- `/app/teachers/[id]/page.tsx` - Main page
- `/app/teachers/[id]/not-found.tsx` - 404 page
- `/components/teachers/rating-distribution.tsx` - Rating bars
- `/components/reviews/review-card.tsx` - Individual cards

**Benefits:** SEO, faster initial load, smaller bundle

### Client Components ("use client")
- `/components/reviews/review-list.tsx` - Needs state for sorting
- `/components/reviews/review-sort.tsx` - Interactive dropdown
- `/components/ui/share-button.tsx` - Browser APIs (clipboard, share)

**Why:** State management, event handlers, browser APIs

## Key Features by Component

### Breadcrumb
- ✓ Light/dark variants
- ✓ Dynamic items
- ✓ ARIA navigation
- ✓ Chevron separators

### ShareButton
- ✓ Web Share API (mobile)
- ✓ Clipboard fallback
- ✓ Visual feedback
- ✓ Error handling

### RatingDistribution
- ✓ Animated bars
- ✓ Percentage calculation
- ✓ Count display
- ✓ Gradient colors

### ReviewList
- ✓ Sort functionality
- ✓ Empty state
- ✓ Review count
- ✓ Memoized sorting

### ReviewCard
- ✓ Star rating
- ✓ Relative dates
- ✓ Avatar with initial
- ✓ Hover effects

## Styling Approach

All components use:
- **Tailwind CSS** utility classes
- **Responsive design** (sm:, md:, lg: breakpoints)
- **Animations** (hover, transition, animate-pulse)
- **Gradients** (blue-purple theme)
- **Shadows** (elevation hierarchy)

## Type Safety

All components are fully typed with TypeScript:
- Interface definitions for props
- Database type definitions
- Supabase query types
- React component types

## Performance Patterns

1. **Server-First**: Default to server components
2. **Client Boundaries**: Only client where needed
3. **Code Splitting**: Automatic for client components
4. **Memoization**: useMemo for sorted reviews
5. **Suspense**: Loading states with Suspense boundaries

## Accessibility Patterns

1. **Semantic HTML**: nav, time, button, select
2. **ARIA Labels**: aria-label, aria-labelledby
3. **Keyboard Nav**: Focusable elements, tab order
4. **Screen Readers**: Descriptive text, alt text
5. **Color Contrast**: WCAG AA compliant

## Testing Checklist

- [ ] Valid teacher ID shows profile
- [ ] Invalid teacher ID shows 404
- [ ] Reviews sort correctly
- [ ] Share button works
- [ ] Breadcrumb navigation works
- [ ] Rating distribution accurate
- [ ] Empty state displays
- [ ] Responsive on mobile
- [ ] Accessible via keyboard
- [ ] SEO metadata present
