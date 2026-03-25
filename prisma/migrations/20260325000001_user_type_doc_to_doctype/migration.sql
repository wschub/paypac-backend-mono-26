-- prisma/migrations/20260325000001_user_type_doc_to_doctype/migration.sql

ALTER TABLE "User"
  ALTER COLUMN "type_doc" TYPE "DocType" USING CASE "type_doc"::text
    WHEN '1'   THEN 'CC'::"DocType"
    WHEN '2'   THEN 'CE'::"DocType"
    WHEN '3'   THEN 'PA'::"DocType"
    WHEN '4'   THEN 'TI'::"DocType"
    WHEN '5'   THEN 'NIT'::"DocType"
    WHEN '6'   THEN 'SSN'::"DocType"
    ELSE 'CC'::"DocType"
  END;