-- RBAC: roles and user_roles tables

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Seed default roles
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_MODERATOR') ON CONFLICT DO NOTHING;

-- Add moderation audit fields to reviews
ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS moderated_by_user_id BIGINT REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_reviews_moderated_by ON reviews(moderated_by_user_id);
