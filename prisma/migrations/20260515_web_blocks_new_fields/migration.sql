-- ============================================
-- WebBlockType: agregar valores nuevos (idempotent)
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'CUSTOM'
      AND enumtypid = 'public."WebBlockType"'::regtype
  ) THEN
    ALTER TYPE "WebBlockType" ADD VALUE 'CUSTOM';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'CATEGORY'
      AND enumtypid = 'public."WebBlockType"'::regtype
  ) THEN
    ALTER TYPE "WebBlockType" ADD VALUE 'CATEGORY';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'EVENT'
      AND enumtypid = 'public."WebBlockType"'::regtype
  ) THEN
    ALTER TYPE "WebBlockType" ADD VALUE 'EVENT';
  END IF;
END $$;

-- ============================================
-- web_blocks_index: agregar nuevos campos (idempotent)
-- ============================================

ALTER TABLE "web_blocks_index"
  ADD COLUMN IF NOT EXISTS "block_order"      INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "block_identifier" TEXT    DEFAULT '',
  ADD COLUMN IF NOT EXISTS "block_config"     JSONB,
  ADD COLUMN IF NOT EXISTS "block_active"     INTEGER;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'web_blocks_index_block_identifier_key'
  ) THEN
    ALTER TABLE "web_blocks_index"
      ADD CONSTRAINT "web_blocks_index_block_identifier_key" UNIQUE ("block_identifier");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "web_blocks_index_country_id_block_order_idx"
  ON "web_blocks_index"("country_id", "block_order");
