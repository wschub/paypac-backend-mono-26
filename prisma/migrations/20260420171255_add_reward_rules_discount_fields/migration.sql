-- prisma/migrations/add_reward_rules_discount_fields.sql
CREATE TYPE "CommissionBase" AS ENUM ('ON_ORIGINAL', 'ON_DISCOUNTED');

ALTER TABLE "EventRewardRules"
  ADD COLUMN "apply_customer_discount" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "customer_discount_type"  INTEGER,
  ADD COLUMN "customer_discount_value" INTEGER,
  ADD COLUMN "commission_base"         "CommissionBase" NOT NULL DEFAULT 'ON_DISCOUNTED';