-- Enums
DO $$ BEGIN CREATE TYPE "TypePayment" AS ENUM ('FREE','PAID');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "GuestStatus" AS ENUM ('PENDING','CONFIRMED','REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Event: new columns
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "type_payment"          "TypePayment" NOT NULL DEFAULT 'PAID';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "confirmation_required" BOOLEAN       NOT NULL DEFAULT false;

-- event_private_guest_list
CREATE TABLE IF NOT EXISTS "event_private_guest_list" (
  "id"           SERIAL        NOT NULL,
  "event_id"     INTEGER       NOT NULL,
  "email"        TEXT          NOT NULL,
  "name"         TEXT,
  "user_id"      INTEGER,
  "status"       "GuestStatus" NOT NULL DEFAULT 'PENDING',
  "invited_at"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "confirmed_at" TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "event_private_guest_list_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "epgl_event_email_key" ON "event_private_guest_list"("event_id","email");
CREATE INDEX IF NOT EXISTS "epgl_event_id_idx"           ON "event_private_guest_list"("event_id");

DO $$ BEGIN ALTER TABLE "event_private_guest_list" ADD CONSTRAINT "epgl_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
