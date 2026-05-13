-- ============================================
-- Agregar campos públicos a tabla Event
-- ============================================

-- Agregar columnas
ALTER TABLE "Event" ADD COLUMN "public_id" TEXT;
ALTER TABLE "Event" ADD COLUMN "public_url" TEXT;
ALTER TABLE "Event" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

-- Crear índices únicos
CREATE UNIQUE INDEX "Event_public_id_key" ON "Event"("public_id");
CREATE UNIQUE INDEX "Event_public_url_key" ON "Event"("public_url");

-- Índice para búsqueda de destacados
CREATE INDEX "Event_featured_idx" ON "Event"("featured");
