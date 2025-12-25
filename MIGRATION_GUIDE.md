# Migration Guide: Drizzle ORM to Supabase Client

This guide explains how to migrate your existing database from Drizzle ORM to Supabase client.

## Current Setup

Your application currently has:
- Drizzle ORM configuration (`drizzle.config.ts`)
- Database schema (`db/schema.ts`)
- Direct PostgreSQL connection (`db/index.ts`)
- Seed script using Drizzle (`db/seed.ts`)

## New Setup

The home page now uses:
- Supabase client for browser operations (`lib/supabase/client.ts`)
- Supabase server client for SSR (`lib/supabase/server.ts`)
- Type-safe database queries with TypeScript interfaces

## Migration Steps

### Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Note your Project URL and anon key from Settings > API

### Step 2: Migrate Your Database Schema

You have two options:

#### Option A: Use Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create the tables using this SQL:

```sql
-- Create teachers table
CREATE TABLE teachers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create reviews table
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  teacher_id BIGINT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_reviews_teacher_id ON reviews(teacher_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_teachers_created_at ON teachers(created_at DESC);
```

#### Option B: Use Your Existing Drizzle Schema
1. Keep using Drizzle for schema management
2. Point `DATABASE_URL` to your Supabase database URL
3. Run `npm run db:push` to apply the schema
4. Use Supabase client for queries

### Step 3: Configure Environment Variables

Create or update `.env.local`:

```env
# Supabase (required for the new home page)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# PostgreSQL (if keeping Drizzle for migrations)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

You can get the Supabase PostgreSQL URL from:
- Supabase Dashboard > Settings > Database > Connection String (URI)

### Step 4: Seed Your Database

Update the seed script to use Supabase:

```typescript
// db/seed-supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
);

async function seed() {
  // Insert teachers
  const { data: teachers, error: teachersError } = await supabase
    .from('teachers')
    .insert([
      { name: 'Dr. Jane Smith', subject: 'Computer Science', department: 'Engineering' },
      { name: 'Prof. John Doe', subject: 'Mathematics', department: 'Science' },
      // ... more teachers
    ])
    .select();

  if (teachersError) {
    console.error('Error inserting teachers:', teachersError);
    return;
  }

  // Insert reviews
  const { error: reviewsError } = await supabase
    .from('reviews')
    .insert([
      {
        teacher_id: teachers[0].id,
        rating: 5,
        comment: 'Excellent professor!',
        reviewer_name: 'Student A'
      },
      // ... more reviews
    ]);

  if (reviewsError) {
    console.error('Error inserting reviews:', reviewsError);
    return;
  }

  console.log('Database seeded successfully!');
}

seed();
```

Or continue using the existing Drizzle seed script if you're keeping Drizzle for migrations.

### Step 5: Update package.json (Optional)

Add a new seed script for Supabase:

```json
{
  "scripts": {
    "db:seed:supabase": "tsx db/seed-supabase.ts"
  }
}
```

### Step 6: Enable Row Level Security (RLS) - Optional but Recommended

For production, enable RLS in Supabase:

```sql
-- Enable RLS
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on teachers"
  ON teachers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert on reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

## Coexistence Strategy

You can keep both Drizzle and Supabase client during the migration:

1. **Use Drizzle for**: Schema management, migrations, seeding
2. **Use Supabase for**: Application queries (better for SSR/SSG)

This allows you to:
- Keep your existing schema definitions
- Use Drizzle Kit for schema changes
- Use Supabase client for better Next.js integration

## Querying Data: Drizzle vs Supabase

### Drizzle Style
```typescript
import { db } from '@/db';
import { teachers, reviews } from '@/db/schema';

const result = await db
  .select()
  .from(teachers)
  .leftJoin(reviews, eq(reviews.teacherId, teachers.id));
```

### Supabase Style
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data } = await supabase
  .from('teachers')
  .select('*, reviews(*)')
  .limit(10);
```

## Benefits of Supabase Client

1. **Better Next.js Integration**: Built-in SSR support with `@supabase/ssr`
2. **Real-time Capabilities**: Subscribe to database changes
3. **Authentication**: Built-in auth system
4. **Storage**: File uploads and management
5. **Edge Functions**: Serverless functions
6. **Auto-generated Types**: Generate TypeScript types from schema

## Testing the Migration

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. You should see the home page with stats (0 teachers, 0 reviews if empty)
4. Add some test data via Supabase dashboard or seed script
5. Refresh the page to see the data

## Troubleshooting

### Error: Missing environment variables
- Make sure `.env.local` exists with correct Supabase credentials
- Restart the dev server after adding environment variables

### Error: relation "teachers" does not exist
- Run the SQL to create tables in Supabase SQL Editor
- Or use `npm run db:push` if using Drizzle

### Error: Failed to fetch
- Check if your Supabase URL and anon key are correct
- Verify RLS policies allow public read access
- Check browser console for CORS errors

### Data not showing up
- Verify data exists in Supabase Table Editor
- Check if RLS policies are blocking access
- Use service role key for testing (never in production)

## Next Steps

After successful migration:
1. Implement remaining pages (`/teachers`, `/teachers/[id]`, etc.)
2. Add authentication using Supabase Auth
3. Set up proper RLS policies for security
4. Configure real-time subscriptions if needed
5. Deploy to Vercel with environment variables

## Keeping Drizzle (Alternative)

If you prefer to continue using Drizzle:
1. Update the home page to use Drizzle instead of Supabase
2. Remove `@supabase/supabase-js` and `@supabase/ssr` dependencies
3. Keep using the existing `db/index.ts` client

The component structure remains the same; only the data fetching layer changes.
