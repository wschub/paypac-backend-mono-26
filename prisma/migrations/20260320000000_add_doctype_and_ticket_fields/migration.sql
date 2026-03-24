-- 1. Crear enum DocType
CREATE TYPE "DocType" AS ENUM (
  'CC', 'CE', 'PA','TI', 'NIT', 'SSN'
);

-- 2. Agregar customer_UUID_phone a Invoice
ALTER TABLE "Invoice"
  ADD COLUMN IF NOT EXISTS "customer_UUID_phone" TEXT;

-- 3. Convertir user_type_doc de Int a DocType en Invoice
ALTER TABLE "Invoice"
  ALTER COLUMN "user_type_doc" TYPE "DocType" USING CASE "user_type_doc"
    WHEN 1 THEN 'CC'::"DocType"
    WHEN 2 THEN 'CE'::"DocType"
    WHEN 3 THEN 'PA'::"DocType"
    WHEN 4 THEN 'TI'::"DocType"
    WHEN 5 THEN 'NIT'::"DocType"
    WHEN 6 THEN 'SSN'::"DocType"
    ELSE 'CC'::"DocType"
  END;

-- 4. Agregar campos nuevos a Ticket
ALTER TABLE "Ticket"
  ADD COLUMN IF NOT EXISTS "device_uuid"   TEXT,
  ADD COLUMN IF NOT EXISTS "totp_secret"   TEXT,
  ADD COLUMN IF NOT EXISTS "user_num_doc"  TEXT,
  ADD COLUMN IF NOT EXISTS "user_type_doc" "DocType",
  ADD COLUMN IF NOT EXISTS "nfc_id"        TEXT;
  