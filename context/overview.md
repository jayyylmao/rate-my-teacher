  🎯 MVP Overview

  Your project will be a teacher rating platform similar to RateMyManager but for educational institutions. You already have the foundation in place with Next.js 16 and a Supabase database containing teachers and reviews.

  📋 Key Implementation Phases

  Phase 1: Foundation (Week 1)

  - Migrate from Drizzle ORM to Supabase client
  - Enable Row Level Security (RLS) on database
  - Add database constraints and indexes
  - Set up rate limiting to prevent spam

  Phase 2: Core Pages (Weeks 2-3)

  1. Home Page - Hero, search, featured teachers
  2. Browse Teachers - Filterable grid with search/sort
  3. Teacher Profile - Rating breakdown, all reviews, add review button
  4. Submit Review - Star rating + comment form
  5. Add Teacher - Form to add new teachers

  Phase 3: Components Library

  Build reusable components: StarRating, TeacherCard, ReviewCard, SearchBar, Pagination, FilterSidebar, RatingDistribution

  Phase 4: Polish (Week 4)

  - SEO optimization with dynamic metadata
  - Input sanitization and validation
  - CAPTCHA on forms
  - Mobile responsiveness
  - Loading states and error handling

  🔒 Security Features

  - RLS policies (public read, anyone can submit reviews)
  - Rate limiting (3 reviews per IP/day)
  - Input validation with Zod schemas
  - Database constraints (rating 1-5, comment length 10-1000 chars)

  🚀 Critical First Steps

  The 5 most important files to create:
  1. /lib/supabase/client.ts - Browser client
  2. /lib/supabase/server.ts - Server client
  3. /app/teachers/[id]/page.tsx - Teacher profile
  4. /app/actions/submit-review.ts - Review submission
  5. /components/ui/star-rating.tsx - Star rating component

  📊 Current Database Schema

  ✅ Already set up in Supabase:
  - teachers: id, name, subject, department, created_at
  - reviews: id, teacher_id, rating, comment, reviewer_name, created_at

  Would you like me to:
  1. Start implementing the foundation (Supabase client setup + RLS)?
  2. Make modifications to the plan first?
  3. Deep dive into a specific feature?