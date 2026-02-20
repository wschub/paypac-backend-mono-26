-- ============================================
-- MIGRACIÓN: Eliminar tabla de templates
-- y actualizar NotificationMessageQueue
-- ============================================

-- Paso 1: Agregar nuevas columnas como opcionales primero
ALTER TABLE "NotificationMessageQueue" 
ADD COLUMN "email_subject" TEXT,
ADD COLUMN "email_body" TEXT;

-- Paso 2: Rellenar con valores por defecto para registros existentes
UPDATE "NotificationMessageQueue" 
SET 
  "email_subject" = COALESCE("template_subject", 'Email de PayPac'),
  "email_body" = COALESCE("template_code", '<p>Contenido del email</p>')
WHERE "email_subject" IS NULL OR "email_body" IS NULL;

-- Paso 3: Hacer las columnas NOT NULL ahora que tienen datos
ALTER TABLE "NotificationMessageQueue" 
ALTER COLUMN "email_subject" SET NOT NULL,
ALTER COLUMN "email_body" SET NOT NULL;

-- Paso 4: Eliminar columnas obsoletas
ALTER TABLE "NotificationMessageQueue" 
DROP COLUMN IF EXISTS "template_id",
DROP COLUMN IF EXISTS "template_subject",
DROP COLUMN IF EXISTS "template_type";

-- Paso 5: Renombrar template_code a solo guardar el código
-- (Ya no es TEXT con HTML, solo el código del template usado)
-- Si template_code ya existe como TEXT, primero lo renombramos temporalmente
ALTER TABLE "NotificationMessageQueue" 
RENAME COLUMN "template_code" TO "template_code_old";

-- Agregamos la nueva columna template_code como VARCHAR
ALTER TABLE "NotificationMessageQueue" 
ADD COLUMN "template_code" VARCHAR(255);

-- Copiamos valores (truncando si es HTML largo)
UPDATE "NotificationMessageQueue" 
SET "template_code" = LEFT("template_code_old", 255);

-- Hacemos NOT NULL y eliminamos la columna vieja
ALTER TABLE "NotificationMessageQueue" 
ALTER COLUMN "template_code" SET NOT NULL;

ALTER TABLE "NotificationMessageQueue" 
DROP COLUMN "template_code_old";

-- Paso 6: Eliminar la tabla de templates y enum
DROP TABLE IF EXISTS "NotificationEmailTemplates";
DROP TYPE IF EXISTS "TemplateTypes";

-- Paso 7: Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS "NotificationMessageQueue_user_id_idx" 
ON "NotificationMessageQueue"("user_id");

CREATE INDEX IF NOT EXISTS "NotificationMessageQueue_status_idx" 
ON "NotificationMessageQueue"("status");

CREATE INDEX IF NOT EXISTS "NotificationMessageQueue_send_at_idx" 
ON "NotificationMessageQueue"("send_at");

CREATE INDEX IF NOT EXISTS "NotificationMessageQueue_template_code_idx" 
ON "NotificationMessageQueue"("template_code");