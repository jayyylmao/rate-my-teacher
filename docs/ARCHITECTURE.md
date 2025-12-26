# Rate My Interview - Architecture Overview

## System Architecture

### Tech Stack

**Frontend**
- Next.js 16.1.1 with App Router (React 19.2.3)
- TypeScript (strict mode)
- Tailwind CSS v4
- Deployed on Vercel: https://hello-world-five-peach.vercel.app

**Backend**
- Spring Boot 3.2.1
- Java 17
- PostgreSQL (Supabase hosted)
- Flyway for database migrations
- Deployed on Fly.io: https://rate-my-teacher-api.fly.dev/

---

## Database Schema

### Tables

**interviews**
- `id` (SERIAL PRIMARY KEY)
- `company` (VARCHAR(255), NOT NULL)
- `role` (VARCHAR(255), NOT NULL)
- `level` (TEXT) - e.g., Junior, Mid, Senior
- `stage` (TEXT) - e.g., Offer, Final Round, etc.
- `location` (VARCHAR(255))
- `created_at` (TIMESTAMP, DEFAULT NOW())

**reviews**
- `id` (SERIAL PRIMARY KEY)
- `interview_id` (INTEGER, FOREIGN KEY → interviews.id, CASCADE DELETE)
- `rating` (INTEGER, NOT NULL, CHECK 1-5)
- `comment` (TEXT, NOT NULL)
- `reviewer_name` (VARCHAR(100), DEFAULT 'Anonymous')
- `round_type` (TEXT) - e.g., PHONE_SCREEN, CODING, SYSTEM_DESIGN
- `interviewer_initials` (VARCHAR(4)) - normalized, uppercase, letters only
- `created_at` (TIMESTAMP, DEFAULT NOW())

**review_tags** (many-to-many)
- `review_id` (INTEGER, FOREIGN KEY → reviews.id, CASCADE DELETE)
- `tag_key` (VARCHAR(50), FOREIGN KEY → tags.key, CASCADE)
- PRIMARY KEY (review_id, tag_key)

**tags**
- `key` (VARCHAR(50), PRIMARY KEY) - e.g., WELL_ORGANIZED, GHOST_JOB
- `label` (VARCHAR(100), NOT NULL) - e.g., "Well organized"
- `category` (VARCHAR(50), NOT NULL) - PROCESS, QUALITY, or BEHAVIOR

### Indexes
- `idx_reviews_interview_id` on reviews(interview_id)
- `idx_reviews_round_type` on reviews(round_type)
- `idx_tags_category` on tags(category)

---

## Backend API Endpoints

### Base URL: `https://rate-my-teacher-api.fly.dev/api`

**Interviews**
- `GET /interview-experiences` - List all interviews with aggregated stats
- `GET /interview-experiences/{id}` - Get interview detail with reviews and rating breakdown
- `POST /interview-experiences` - Create new interview

**Reviews**
- `POST /reviews` - Add review to interview (with tags, round type, initials)

**Tags**
- `GET /tags` - Get all available tags grouped by category

### Request/Response Formats

**Create Review Request**
```json
{
  "interviewId": 1,
  "rating": 5,
  "comment": "Great interview experience...",
  "reviewerName": "John D.",
  "tags": ["WELL_ORGANIZED", "RESPECTFUL"],
  "roundType": "CODING",
  "interviewerInitials": "A.P."
}
```

**Interview Detail Response**
```json
{
  "interview": {
    "id": 1,
    "company": "Google",
    "role": "Software Engineer",
    "level": "L4",
    "stage": "Offer",
    "location": "Mountain View, CA",
    "reviewCount": 15,
    "averageRating": 4.3,
    "createdAt": "2025-01-15T10:00:00Z"
  },
  "reviews": [...],
  "ratingBreakdown": {
    "5": 8,
    "4": 5,
    "3": 1,
    "2": 1,
    "1": 0
  }
}
```

---

## Frontend Architecture

### Key Routes

**App Router Structure**
```
/app
  /page.tsx                    - Home page
  /interviews
    /page.tsx                  - Browse interviews
    /[id]
      /page.tsx                - Interview detail with reviews
      /review/page.tsx         - Write review form
    /new/page.tsx              - Create new interview
  /teachers                    - (Legacy Rate My Teacher pages)
```

### Component Architecture

**Review Card Component** (`components/reviews/review-card-new.tsx`)
- Process-first design with round type prominence
- Comment truncation (300+ chars show "Show more")
- Tag chips display
- Reviewer name + optional interviewer initials
- Helpful/Report actions (stubs)

**Interview Review Form** (`components/reviews/interview-review-form.tsx`)
- Star rating (required)
- Comment textarea (required, max 2000 chars)
- Tag selection (required, grouped by category)
- Reviewer name (optional, defaults to "Anonymous")
- Round type dropdown (optional)
- Interviewer initials input (optional, max 4 letters)

**Utilities**
- `lib/utils/format.ts` - Formatting helpers for round types, tags, dates, initials
- `lib/api/` - Type-safe API client wrappers

---

## Data Flow

### Review Submission Flow

1. **Frontend** - User fills out review form
2. **Client-side normalization** - Interviewer initials normalized (strip dots/spaces, uppercase)
3. **API Request** - POST to `/api/reviews` with payload
4. **Backend validation** - Jakarta validation on DTOs
5. **Server-side normalization** - Re-normalize initials, validate constraints
6. **Database insert** - Review saved with tags via many-to-many relationship
7. **Redirect** - User redirected back to interview detail page
8. **Cache refresh** - Next.js revalidates page data

### Review Display Flow

1. **Server component** - Fetch interview + reviews from API
2. **Backend aggregation** - Calculate averageRating and ratingBreakdown
3. **Response mapping** - Convert entities to DTOs with all fields
4. **Client rendering** - ReviewList sorts and displays ReviewCards
5. **User interaction** - "Show more" toggle for long comments

---

## Key Design Patterns

### Backend
- **DTO Pattern** - Separate request/response DTOs from entities
- **Service Layer** - Business logic in services, controllers are thin
- **Repository Pattern** - JPA repositories for data access
- **Response Wrapping** - All list endpoints return `{ items: [...] }`
- **Server-side Normalization** - Critical data normalized before DB (initials)

### Frontend
- **Server Components** - Data fetching in page.tsx (no client-side fetching)
- **Client Components** - Interactive UI marked with "use client"
- **Type Safety** - Shared TypeScript types between API and components
- **Formatting Utilities** - Centralized formatters for consistency

---

## Deployment Configuration

### Backend (Fly.io)
- **App Name**: rate-my-teacher-api
- **Region**: ewr (New Jersey)
- **Resources**: 2 VMs, 1 CPU, 1024 MB each
- **Database**: Supabase PostgreSQL
- **Build**: Multi-stage Docker build (Maven + JRE Alpine)

### Frontend (Vercel)
- **Framework**: Next.js 16.1.1 (Turbopack)
- **Build Command**: `next build`
- **Environment**: Node.js 18+
- **API Proxy**: Connects to Fly.io backend
- **Environment Variables**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`

---

## Recent Changes (Dec 2025)

### Review Card UI Enhancement
- Added `round_type` and `interviewer_initials` columns to reviews table (Migration V3)
- Updated backend DTOs and services with validation and normalization
- Created new ReviewCard component with process-first design
- Added formatting utilities for round types, tags, and dates
- Deployed backend and frontend with new features

### Migration History
- **V1**: Initial schema (interviews, reviews, tags tables)
- **V2**: Added review_tags many-to-many relationship
- **V3**: Added round_type and interviewer_initials to reviews

---

## Development Setup

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend
```bash
npm install
npm run dev
```

### Database Migrations
Migrations run automatically on backend startup via Flyway. Migration files are located in `backend/src/main/resources/db/migration/`.

---

This architecture supports a scalable, type-safe interview review platform with rich metadata (round types, tags, interviewer identifiers) while maintaining data privacy and normalization standards.
