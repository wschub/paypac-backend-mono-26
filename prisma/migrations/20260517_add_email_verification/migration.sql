ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email_verification_code"         TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email_verification_expires_at"   TIMESTAMP(3);
