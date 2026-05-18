-- ============================================================
-- Fix private event fields (idempotent)
-- ============================================================

-- 1. TypePayment: agregar valor CONTRIBUTION
DO $$ BEGIN
  ALTER TYPE "TypePayment" ADD VALUE IF NOT EXISTS 'CONTRIBUTION';
EXCEPTION WHEN others THEN null; END $$;

-- 2. GuestPaymentStatus enum (nuevo)
DO $$ BEGIN
  CREATE TYPE "GuestPaymentStatus" AS ENUM ('PENDING','PAID','EXEMPT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Event: campo faltante
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "private_price_ticket" INTEGER NOT NULL DEFAULT 0;

-- 4. event_private_guest_list: campos faltantes del requerimiento
ALTER TABLE "event_private_guest_list" ADD COLUMN IF NOT EXISTS "last_name"           TEXT;
ALTER TABLE "event_private_guest_list" ADD COLUMN IF NOT EXISTS "phone_number"        TEXT;
ALTER TABLE "event_private_guest_list" ADD COLUMN IF NOT EXISTS "payment_status"      "GuestPaymentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "event_private_guest_list" ADD COLUMN IF NOT EXISTS "invoice_id"          INTEGER;
ALTER TABLE "event_private_guest_list" ADD COLUMN IF NOT EXISTS "transaction_id"      TEXT;
ALTER TABLE "event_private_guest_list" ADD COLUMN IF NOT EXISTS "email_notification"  BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "event_private_guest_list" ADD COLUMN IF NOT EXISTS "phone_notification"  BOOLEAN NOT NULL DEFAULT false;
