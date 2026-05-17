-- Enums
DO $$ BEGIN CREATE TYPE "TicketSaleType" AS ENUM ('FIXED','AUCTION');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "TicketSaleStatus" AS ENUM ('ACTIVE','SOLD','CANCELLED','EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "TicketOfferStatus" AS ENUM ('PENDING','ACCEPTED','REJECTED','EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ticket_sale_listings
CREATE TABLE IF NOT EXISTS "ticket_sale_listings" (
  "id"           SERIAL        NOT NULL,
  "ticket_id"    INTEGER       NOT NULL,
  "seller_id"    INTEGER       NOT NULL,
  "sale_type"    "TicketSaleType" NOT NULL,
  "asking_price" INTEGER,
  "min_price"    INTEGER,
  "status"       "TicketSaleStatus" NOT NULL DEFAULT 'ACTIVE',
  "expires_at"   TIMESTAMP(3)  NOT NULL,
  "buyer_id"     INTEGER,
  "sold_price"   INTEGER,
  "sold_at"      TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "ticket_sale_listings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "tsl_ticket_id_key" ON "ticket_sale_listings"("ticket_id");
CREATE INDEX IF NOT EXISTS "tsl_seller_id_idx"        ON "ticket_sale_listings"("seller_id");
CREATE INDEX IF NOT EXISTS "tsl_status_idx"           ON "ticket_sale_listings"("status");

DO $$ BEGIN ALTER TABLE "ticket_sale_listings" ADD CONSTRAINT "tsl_ticket_id_fkey"
  FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "ticket_sale_listings" ADD CONSTRAINT "tsl_seller_id_fkey"
  FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "ticket_sale_listings" ADD CONSTRAINT "tsl_buyer_id_fkey"
  FOREIGN KEY ("buyer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ticket_sale_offers
CREATE TABLE IF NOT EXISTS "ticket_sale_offers" (
  "id"                  SERIAL        NOT NULL,
  "listing_id"          INTEGER       NOT NULL,
  "buyer_id"            INTEGER       NOT NULL,
  "amount"              INTEGER       NOT NULL,
  "status"              "TicketOfferStatus" NOT NULL DEFAULT 'PENDING',
  "notified_to_pay_at"  TIMESTAMP(3),
  "createdAt"           TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "ticket_sale_offers_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "tso_listing_id_idx" ON "ticket_sale_offers"("listing_id");
CREATE INDEX IF NOT EXISTS "tso_buyer_id_idx"   ON "ticket_sale_offers"("buyer_id");

DO $$ BEGIN ALTER TABLE "ticket_sale_offers" ADD CONSTRAINT "tso_listing_id_fkey"
  FOREIGN KEY ("listing_id") REFERENCES "ticket_sale_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TABLE "ticket_sale_offers" ADD CONSTRAINT "tso_buyer_id_fkey"
  FOREIGN KEY ("buyer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
