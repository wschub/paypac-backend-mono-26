-- prisma/migrations/20260325000000_invoice_user_type_doc_to_doctype/migration.sql

ALTER TABLE "Invoice"
  ALTER COLUMN "user_type_doc" TYPE "DocType" USING CASE "user_type_doc"::text
    WHEN '1'   THEN 'CC'::"DocType"
    WHEN '2'   THEN 'CE'::"DocType"
    WHEN '4'   THEN 'PA'::"DocType"
    WHEN '3'   THEN 'TI'::"DocType"
    WHEN '4'   THEN 'NIT'::"DocType"
    WHEN '5'   THEN 'SSN'::"DocType"
    WHEN 'CC'  THEN 'CC'::"DocType"
    ELSE 'CC'::"DocType"
  END;

ALTER TABLE "Invoice"
  ALTER COLUMN "user_type_doc" SET DEFAULT 'CC'::"DocType";