/*
  Warnings:

  - The values [PRECESSING] on the enum `InvoiceStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "EventLiquidationStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- AlterEnum
BEGIN;
CREATE TYPE "InvoiceStatus_new" AS ENUM ('ISSUED', 'PROCESSING', 'PAID', 'PENDING', 'REJECTED', 'CANCELED', 'REFUNDED');
ALTER TABLE "Invoice" ALTER COLUMN "status" TYPE "InvoiceStatus_new" USING ("status"::text::"InvoiceStatus_new");
ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_old";
ALTER TYPE "InvoiceStatus_new" RENAME TO "InvoiceStatus";
DROP TYPE "public"."InvoiceStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "nps_score" INTEGER;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "refunded_amount" INTEGER,
ADD COLUMN     "refunded_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "city" TEXT;

-- CreateTable
CREATE TABLE "EventLiquidation" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "num_liquidation" TEXT NOT NULL,
    "gross_amount" DOUBLE PRECISION NOT NULL,
    "paypac_commission" DOUBLE PRECISION NOT NULL,
    "promoter_commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refunds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net_amount" DOUBLE PRECISION NOT NULL,
    "status" "EventLiquidationStatus" NOT NULL DEFAULT 'PENDING',
    "liquidation_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventLiquidation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventLiquidation_num_liquidation_key" ON "EventLiquidation"("num_liquidation");

-- CreateIndex
CREATE INDEX "EventLiquidation_company_id_idx" ON "EventLiquidation"("company_id");

-- CreateIndex
CREATE INDEX "EventLiquidation_event_id_idx" ON "EventLiquidation"("event_id");

-- CreateIndex
CREATE INDEX "EventLiquidation_status_idx" ON "EventLiquidation"("status");

-- AddForeignKey
ALTER TABLE "EventLiquidation" ADD CONSTRAINT "EventLiquidation_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLiquidation" ADD CONSTRAINT "EventLiquidation_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
