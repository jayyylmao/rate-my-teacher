# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
npm run dev          # Start Next.js development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Operations
```bash
npm run db:push      # Push schema changes to PostgreSQL database
npm run db:studio    # Open Drizzle Studio for database management UI
npm run db:seed      # Seed database with sample data (teachers and reviews)
```

### Environment Setup
The project requires `.env.local` with:
- `DATABASE_URL` - PostgreSQL connection string

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16.1.1 with App Router
- **React**: Version 19.2.3
- **Database**: PostgreSQL with Drizzle ORM 0.45.1
- **Styling**: Tailwind CSS v4
- **TypeScript**: Strict mode enabled with `@/*` path alias

### Database Architecture

**Schema Location**: `db/schema.ts`

The database has two main tables:
- **teachers**: Stores teacher profiles (id, name, subject, department, createdAt)
- **reviews**: Student reviews with ratings and comments (foreign key to teachers with cascade delete)

**Database Client**: Initialized in `db/index.ts` using the `postgres` package wrapped with Drizzle ORM for type-safe queries.

**Drizzle Configuration** (`drizzle.config.ts`):
- Uses PostgreSQL dialect
- Schema: `./db/schema.ts`
- Migrations output: `./db/migrations`
- Loads credentials from `.env.local`

### Project Structure

```
/app              - Next.js App Router pages and layouts
  page.tsx        - Home page (client component with interactive button)
  layout.tsx      - Root layout with Geist font and metadata
  globals.css     - Tailwind CSS with custom animations
/db               - Database layer
  schema.ts       - Drizzle schema definitions
  index.ts        - Database client initialization
  seed.ts         - Sample data seeding script
/public           - Static assets
```

### Key Patterns

**Import Alias**: Use `@/` to reference root-level imports (configured in `tsconfig.json`)

**Client Components**: Mark components with `"use client"` when using React hooks or browser APIs (e.g., `app/page.tsx`)

**Database Queries**: Import `db` from `@/db` and use Drizzle ORM's type-safe query builders. Schema types are auto-generated from `db/schema.ts`.

**Styling**: Tailwind CSS utility classes. Custom animations defined in `globals.css` (fade-in, slide-up).

### Dependencies Note

`@supabase/supabase-js` is installed but not currently integrated into the application. The database connection uses direct PostgreSQL via Drizzle ORM instead of Supabase client libraries.
