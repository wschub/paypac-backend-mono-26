-- PaymentMethodsUI: add method_code
ALTER TABLE "PaymentMethodsUI" ADD COLUMN IF NOT EXISTS "method_code" TEXT;

-- Invoice: add payment_method, points_used, points_discount
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "payment_method"  TEXT    NOT NULL DEFAULT 'CARD';
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "points_used"     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "points_discount" INTEGER NOT NULL DEFAULT 0;
