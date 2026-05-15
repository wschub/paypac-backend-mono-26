-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "SalesChannel" AS ENUM ('WEB', 'APP');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'DESKTOP', 'TABLET');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "EventView" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "session_token" TEXT NOT NULL,
    "session_duration" INTEGER NOT NULL DEFAULT 0,
    "session_ip" TEXT NOT NULL,
    "session_channel" "SalesChannel" NOT NULL DEFAULT 'WEB',
    "session_conversion" BOOLEAN NOT NULL DEFAULT false,
    "country_id" INTEGER,
    "city_id" INTEGER,
    "user_agent" TEXT,
    "referrer" TEXT,
    "device_type" "DeviceType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EventView_event_id_createdAt_idx" ON "EventView"("event_id", "createdAt");
CREATE INDEX IF NOT EXISTS "EventView_event_id_session_conversion_idx" ON "EventView"("event_id", "session_conversion");
CREATE INDEX IF NOT EXISTS "EventView_user_id_idx" ON "EventView"("user_id");
CREATE INDEX IF NOT EXISTS "EventView_session_token_idx" ON "EventView"("session_token");
CREATE UNIQUE INDEX IF NOT EXISTS "EventView_event_id_session_token_key" ON "EventView"("event_id", "session_token");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "EventView" ADD CONSTRAINT "EventView_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "EventView" ADD CONSTRAINT "EventView_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "EventView" ADD CONSTRAINT "EventView_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "EventView" ADD CONSTRAINT "EventView_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "Cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
