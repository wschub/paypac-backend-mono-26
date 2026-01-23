/*
  Warnings:

  - You are about to drop the column `description` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `expition_date` on the `EventBalancePromoters` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[company_email]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Company_email_key";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "description",
DROP COLUMN "email",
DROP COLUMN "logo",
DROP COLUMN "phone_number",
ADD COLUMN     "company_description" TEXT,
ADD COLUMN     "company_email" TEXT,
ADD COLUMN     "company_logo" TEXT,
ADD COLUMN     "company_phone_number" TEXT;

-- AlterTable
ALTER TABLE "EventBalancePromoters" DROP COLUMN "expition_date",
ADD COLUMN     "expiration_date" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Company_company_email_key" ON "Company"("company_email");
