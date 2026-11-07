ALTER TABLE refresh_tokens ADD COLUMN revoked_at TIMESTAMPTZ;
CREATE INDEX idx_refresh_user ON refresh_tokens (user_id);

CREATE TABLE password_reset_tokens (
                                       id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                       user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                       token_hash VARCHAR(100) NOT NULL UNIQUE,
                                       expires_at TIMESTAMPTZ NOT NULL,
                                       used       BOOLEAN NOT NULL DEFAULT FALSE,
                                       created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reset_user ON password_reset_tokens (user_id);