-- Agregar description que faltó
ALTER TABLE "EventRewardRules"
  ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Verificar que los otros campos existan (IF NOT EXISTS es seguro si ya están)
ALTER TABLE "EventRewardRules"
  ADD COLUMN IF NOT EXISTS "apply_customer_discount" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "customer_discount_type"  INTEGER,
  ADD COLUMN IF NOT EXISTS "customer_discount_value" INTEGER,
  ADD COLUMN IF NOT EXISTS "commission_base"         "CommissionBase" NOT NULL DEFAULT 'ON_DISCOUNTED';