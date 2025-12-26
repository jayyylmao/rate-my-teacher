-- Auth tables for email-based passwordless authentication

-- Enable citext extension for case-insensitive email storage
CREATE EXTENSION IF NOT EXISTS citext;

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email CITEXT UNIQUE NOT NULL,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Sessions table (server-side session storage)
CREATE TABLE sessions (
    id VARCHAR(64) PRIMARY KEY,  -- sid cookie value
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Auth challenges table (OTP / magic link verification)
CREATE TABLE auth_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT NOT NULL,
    code_hash VARCHAR(255),      -- hashed OTP code
    token_hash VARCHAR(255),     -- hashed magic link token
    expires_at TIMESTAMPTZ NOT NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_challenges_email ON auth_challenges(email);
CREATE INDEX idx_auth_challenges_expires_at ON auth_challenges(expires_at);

-- Author type enum for reviews
CREATE TYPE author_type AS ENUM ('GUEST', 'USER');

-- Add author fields to reviews
ALTER TABLE reviews
    ADD COLUMN author_type author_type NOT NULL DEFAULT 'GUEST',
    ADD COLUMN author_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_reviews_author_user_id ON reviews(author_user_id);
