CREATE TABLE IF NOT EXISTS "event_waiting_list" (
    "id"           SERIAL        NOT NULL,
    "event_id"     INTEGER       NOT NULL,
    "locality_id"  INTEGER,
    "name"         TEXT          NOT NULL,
    "last_name"    TEXT          NOT NULL,
    "email"        TEXT          NOT NULL,
    "phone_number" TEXT          NOT NULL,
    "createdAt"    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3)  NOT NULL,

    CONSTRAINT "event_waiting_list_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "event_waiting_list_email_event_id_key"
  ON "event_waiting_list"("email", "event_id");

CREATE INDEX IF NOT EXISTS "event_waiting_list_event_id_idx"
  ON "event_waiting_list"("event_id");

CREATE INDEX IF NOT EXISTS "event_waiting_list_locality_id_idx"
  ON "event_waiting_list"("locality_id");

DO $$ BEGIN
  ALTER TABLE "event_waiting_list"
    ADD CONSTRAINT "event_waiting_list_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "event_waiting_list"
    ADD CONSTRAINT "event_waiting_list_locality_id_fkey"
    FOREIGN KEY ("locality_id") REFERENCES "EventLocalities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
