CREATE TABLE email_verification_tokens (
                                           id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                           user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                           token_hash VARCHAR(100) NOT NULL UNIQUE,
                                           expires_at TIMESTAMPTZ NOT NULL,
                                           used       BOOLEAN NOT NULL DEFAULT FALSE,
                                           created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_emailver_user ON email_verification_tokens (user_id);

-- বিদ্যমান ইউজারদের লগইন যেন না ভাঙে
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE;