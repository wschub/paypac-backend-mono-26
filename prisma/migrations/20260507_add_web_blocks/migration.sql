-- ============================================
-- ENUM: WebBlockType
-- ============================================

CREATE TYPE "WebBlockType" AS ENUM ('EVENTOS', 'BANNER', 'SLIDE', 'CAROUSEL');

-- ============================================
-- TABLA: web_blocks_index
-- ============================================

CREATE TABLE "web_blocks_index" (
    "id" SERIAL NOT NULL,
    "country_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" "WebBlockType" NOT NULL,
    "banner_img" TEXT,
    "banner_text" TEXT,
    "banner_link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "web_blocks_index_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- TABLA: web_blocks_events
-- ============================================

CREATE TABLE "web_blocks_events" (
    "id" SERIAL NOT NULL,
    "block_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "web_blocks_events_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- TABLA: web_blocks_slide_imgs
-- ============================================

CREATE TABLE "web_blocks_slide_imgs" (
    "id" SERIAL NOT NULL,
    "block_id" INTEGER NOT NULL,
    "event_id" INTEGER,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "web_blocks_slide_imgs_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX "web_blocks_index_country_id_idx" ON "web_blocks_index"("country_id");
CREATE INDEX "web_blocks_index_type_idx" ON "web_blocks_index"("type");

CREATE UNIQUE INDEX "web_blocks_events_block_id_event_id_key" ON "web_blocks_events"("block_id", "event_id");
CREATE INDEX "web_blocks_events_block_id_idx" ON "web_blocks_events"("block_id");
CREATE INDEX "web_blocks_events_event_id_idx" ON "web_blocks_events"("event_id");

CREATE INDEX "web_blocks_slide_imgs_block_id_idx" ON "web_blocks_slide_imgs"("block_id");
CREATE INDEX "web_blocks_slide_imgs_event_id_idx" ON "web_blocks_slide_imgs"("event_id");

-- ============================================
-- FOREIGN KEYS
-- ============================================

ALTER TABLE "web_blocks_index" ADD CONSTRAINT "web_blocks_index_country_id_fkey" 
  FOREIGN KEY ("country_id") REFERENCES "Countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "web_blocks_events" ADD CONSTRAINT "web_blocks_events_block_id_fkey" 
  FOREIGN KEY ("block_id") REFERENCES "web_blocks_index"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "web_blocks_events" ADD CONSTRAINT "web_blocks_events_event_id_fkey" 
  FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "web_blocks_slide_imgs" ADD CONSTRAINT "web_blocks_slide_imgs_block_id_fkey" 
  FOREIGN KEY ("block_id") REFERENCES "web_blocks_index"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "web_blocks_slide_imgs" ADD CONSTRAINT "web_blocks_slide_imgs_event_id_fkey" 
  FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
