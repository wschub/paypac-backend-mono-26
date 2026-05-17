-- Enum
DO $$ BEGIN CREATE TYPE "PromoterRequestStatus" AS ENUM ('PENDING','APPROVED','REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- promoter_requests
CREATE TABLE IF NOT EXISTS "promoter_requests" (
  "id"               SERIAL                    NOT NULL,
  "user_id"          INTEGER                   NOT NULL,
  "status"           "PromoterRequestStatus"   NOT NULL DEFAULT 'PENDING',
  "motivation"       TEXT,
  "reviewed_by_id"   INTEGER,
  "reviewed_at"      TIMESTAMP(3),
  "rejection_reason" TEXT,
  "createdAt"        TIMESTAMP(3)              NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3)              NOT NULL,
  CONSTRAINT "promoter_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "pr_user_id_idx"  ON "promoter_requests"("user_id");
CREATE INDEX IF NOT EXISTS "pr_status_idx"   ON "promoter_requests"("status");

DO $$ BEGIN ALTER TABLE "promoter_requests" ADD CONSTRAINT "pr_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER TABLE "promoter_requests" ADD CONSTRAINT "pr_reviewed_by_fkey"
  FOREIGN KEY ("reviewed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
