-- Agregar valor al enum WebBlockType (si no existe ya)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'CUSTOM'
      AND enumtypid = 'public."WebBlockType"'::regtype
  ) THEN
    ALTER TYPE "WebBlockType" ADD VALUE 'CUSTOM';
  END IF;
END $$;

-- Agregar nuevos campos a web_blocks_index
ALTER TABLE "web_blocks_index"
  ADD COLUMN "block_order"      INTEGER     NOT NULL DEFAULT 1,
  ADD COLUMN "block_identifier" TEXT        NOT NULL DEFAULT '',
  ADD COLUMN "block_config"     JSONB;

-- Hacer block_identifier unique (después de agregar la columna)
ALTER TABLE "web_blocks_index"
  ADD CONSTRAINT "web_blocks_index_block_identifier_key" UNIQUE ("block_identifier");

-- Índice compuesto para ordenamiento por país
CREATE INDEX "web_blocks_index_country_id_block_order_idx"
  ON "web_blocks_index"("country_id", "block_order");
