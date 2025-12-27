-- Convert author_type from Postgres ENUM to VARCHAR for JPA compatibility

-- First, alter the column to use VARCHAR instead of the custom enum type
ALTER TABLE reviews
    ALTER COLUMN author_type TYPE VARCHAR(10) USING author_type::text;

-- Drop the custom enum type (cascade if needed)
DROP TYPE IF EXISTS author_type CASCADE;
