-- ============================================
-- Agregar campos públicos a tabla Event (idempotent)
-- ============================================

ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "public_id" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "public_url" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS "Event_public_id_key" ON "Event"("public_id");
CREATE UNIQUE INDEX IF NOT EXISTS "Event_public_url_key" ON "Event"("public_url");
CREATE INDEX IF NOT EXISTS "Event_featured_idx" ON "Event"("featured");
