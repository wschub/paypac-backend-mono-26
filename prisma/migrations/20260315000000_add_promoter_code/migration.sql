CREATE TABLE "PromoterCode" (
  "id" SERIAL PRIMARY KEY,
  "promoter_id" INTEGER NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "uses_count" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromoterCode_promoter_id_fkey" FOREIGN KEY ("promoter_id") REFERENCES "User"("id")
);

CREATE INDEX "PromoterCode_promoter_id_idx" ON "PromoterCode"("promoter_id");
CREATE INDEX "PromoterCode_code_idx" ON "PromoterCode"("code");

ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "promoter_code_id" INTEGER REFERENCES "PromoterCode"("id");

ALTER TABLE "EventBalancePromoters" ADD COLUMN IF NOT EXISTS "invoice_id" INTEGER;
ALTER TABLE "EventBalancePromoters" ADD COLUMN IF NOT EXISTS "tickets_sold" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "EventDcto" ADD COLUMN IF NOT EXISTS "code" TEXT UNIQUE;
ALTER TABLE "EventDcto" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "EventDcto" ADD COLUMN IF NOT EXISTS "max_uses" INTEGER;
ALTER TABLE "EventDcto" ADD COLUMN IF NOT EXISTS "uses_count" INTEGER NOT NULL DEFAULT 0;