# Quick Start Guide - Rate My Teacher

Get your Rate My Teacher application up and running in 5 minutes.

## Prerequisites

- Node.js installed
- A Supabase account (free tier works)
- Git (optional)

## Step 1: Set Up Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - Project name: `rate-my-teacher`
   - Database password: (save this!)
   - Region: Choose closest to you
4. Wait for database to be created (~2 minutes)

## Step 2: Create Database Tables (1 minute)

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Paste this SQL and click "Run":

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

-- Create indexes
CREATE INDEX idx_reviews_teacher_id ON reviews(teacher_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_teachers_created_at ON teachers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for demo)
CREATE POLICY "Allow public read access on teachers"
  ON teachers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);
```

## Step 3: Get Your Supabase Credentials (30 seconds)

1. In Supabase, go to **Settings** > **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 4: Configure Environment Variables (30 seconds)

1. In your project folder, create `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and paste your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Add Sample Data (1 minute)

1. In Supabase, go to **SQL Editor**
2. Run this to add sample data:

```sql
-- Insert sample teachers
INSERT INTO teachers (name, subject, department) VALUES
  ('Dr. Jane Smith', 'Computer Science', 'Engineering'),
  ('Prof. John Doe', 'Mathematics', 'Science'),
  ('Dr. Emily Brown', 'Physics', 'Science'),
  ('Prof. Michael Johnson', 'English Literature', 'Humanities'),
  ('Dr. Sarah Williams', 'Chemistry', 'Science'),
  ('Prof. David Lee', 'History', 'Humanities');

-- Insert sample reviews
INSERT INTO reviews (teacher_id, rating, comment, reviewer_name) VALUES
  (1, 5, 'Excellent professor! Very clear explanations.', 'Alex'),
  (1, 4, 'Great teacher, tough grader.', 'Sam'),
  (2, 5, 'Best math teacher I have had!', 'Jordan'),
  (2, 5, 'Makes difficult concepts easy to understand.', 'Casey'),
  (3, 4, 'Engaging lectures, fair exams.', 'Taylor'),
  (3, 5, 'Passionate about physics!', 'Morgan'),
  (4, 3, 'Good teacher but lots of reading.', 'Riley'),
  (5, 5, 'Amazing lab sessions!', 'Avery'),
  (5, 4, 'Very knowledgeable and helpful.', 'Quinn'),
  (6, 4, 'Interesting discussions in class.', 'Skyler');
```

## Step 6: Run the Application (30 seconds)

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## What You Should See

1. **Hero section** with a search bar
2. **Quick stats** showing:
   - 6 Teachers
   - 10 Reviews
3. **Featured teachers** section with 6 teacher cards showing:
   - Teacher names with initials avatars
   - Subjects and departments
   - Star ratings
   - Review counts
4. **Call-to-action** buttons

## Verify Everything Works

### Test 1: Check Stats
- You should see "6 Teachers" and "10 Reviews"
- If you see "0 Teachers", check your environment variables

### Test 2: View Teachers
- You should see 6 teacher cards
- Each should have a colored avatar with initials
- Ratings should show as yellow stars

### Test 3: Search Bar
- Type in the search box
- Press Enter (will navigate to /search page - not yet implemented)

### Test 4: Click a Teacher Card
- Click on any teacher card
- Will navigate to /teachers/[id] page (not yet implemented)

## Troubleshooting

### "Error: Missing environment variables"
- Make sure `.env.local` exists
- Verify both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart dev server after adding variables: `npm run dev`

### "relation 'teachers' does not exist"
- Go to Supabase SQL Editor
- Run the table creation SQL from Step 2

### Page shows "0 Teachers, 0 Reviews"
- Check if tables have data in Supabase Table Editor
- Verify RLS policies allow public read access
- Check browser console for errors

### "Failed to fetch" errors
- Verify Supabase URL is correct (should start with `https://`)
- Check anon key is correct (should be a long JWT)
- Make sure your Supabase project is not paused

## Next Steps

Now that your home page is working, you can:

1. **Implement teacher detail page** (`/app/teachers/[id]/page.tsx`)
2. **Add teacher listing page** (`/app/teachers/page.tsx`)
3. **Create search results page** (`/app/search/page.tsx`)
4. **Build add teacher form** (`/app/teachers/new/page.tsx`)
5. **Add review submission form** (`/app/teachers/[id]/review/page.tsx`)

## File Structure Reference

```
/Users/yee/hello-world/
├── app/page.tsx              # ✅ Home page (implemented)
├── components/
│   ├── ui/                   # ✅ Reusable UI components
│   ├── search/              # ✅ Search bar
│   └── teachers/            # ✅ Teacher card
└── lib/
    └── supabase/            # ✅ Supabase clients
```

## Production Deployment

When ready to deploy:

1. **Vercel** (Recommended):
   ```bash
   npm run build  # Test production build
   vercel         # Deploy
   ```
   - Add environment variables in Vercel dashboard
   - Same two variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Update RLS policies** for production security
3. **Add authentication** using Supabase Auth
4. **Set up monitoring** with Vercel Analytics

## Getting Help

- Check `README_IMPLEMENTATION.md` for detailed documentation
- See `MIGRATION_GUIDE.md` for Drizzle to Supabase migration
- Review `PROJECT_STRUCTURE.md` for architecture overview

## Summary

You now have a fully functional home page with:
- Modern, responsive design
- Real-time data from Supabase
- Server-side rendering for SEO
- Type-safe TypeScript code
- Reusable components
- Production-ready architecture

Build time: ~5 minutes
Status: ✅ Ready for development

---

**What's Working:**
✅ Home page with hero, stats, and featured teachers
✅ Supabase integration
✅ Responsive design
✅ Search bar (UI only)
✅ Teacher cards with ratings

**What's Next:**
⏳ Teacher detail pages
⏳ Search results page
⏳ Add teacher form
⏳ Review submission
⏳ Authentication
