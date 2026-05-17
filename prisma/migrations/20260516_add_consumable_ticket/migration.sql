-- EventLocalities: consumable and entry-time config
ALTER TABLE "EventLocalities" ADD COLUMN IF NOT EXISTS "is_consumable"   BOOLEAN       NOT NULL DEFAULT false;
ALTER TABLE "EventLocalities" ADD COLUMN IF NOT EXISTS "vip_access"      BOOLEAN       NOT NULL DEFAULT false;
ALTER TABLE "EventLocalities" ADD COLUMN IF NOT EXISTS "entry_time_open"  TIMESTAMP(3);
ALTER TABLE "EventLocalities" ADD COLUMN IF NOT EXISTS "entry_time_close" TIMESTAMP(3);

-- Ticket: consumable snapshot fields
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "is_consumable"    BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "consumable_total" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "consumable_used"  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "vip_access"       BOOLEAN NOT NULL DEFAULT false;

-- ticket_consumptions
CREATE TABLE IF NOT EXISTS "ticket_consumptions" (
  "id"             SERIAL        NOT NULL,
  "ticket_id"      INTEGER       NOT NULL,
  "amount"         INTEGER       NOT NULL,
  "description"    TEXT,
  "consumed_by_id" INTEGER       NOT NULL,
  "consumed_at"    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"      TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "ticket_consumptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "tc_ticket_id_idx" ON "ticket_consumptions"("ticket_id");

DO $$ BEGIN ALTER TABLE "ticket_consumptions" ADD CONSTRAINT "tc_ticket_id_fkey"
  FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN ALTER TABLE "ticket_consumptions" ADD CONSTRAINT "tc_consumed_by_fkey"
  FOREIGN KEY ("consumed_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
