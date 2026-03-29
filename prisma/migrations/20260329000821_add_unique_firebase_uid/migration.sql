/*
  Warnings:

  - You are about to drop the column `commission_to_charge` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `commission_to_promoter` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[firebase_uid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `type_doc` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_promoter_code_id_fkey";

-- DropForeignKey
ALTER TABLE "PromoterCode" DROP CONSTRAINT "PromoterCode_promoter_id_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "commission_to_charge",
DROP COLUMN "commission_to_promoter";

-- AlterTable
ALTER TABLE "GeneralSettingsVariables" ADD COLUMN     "type_visibility" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "PromoterCode" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "type_doc" SET NOT NULL,
ALTER COLUMN "type_doc" SET DEFAULT 'CC';

-- CreateIndex
CREATE UNIQUE INDEX "User_firebase_uid_key" ON "User"("firebase_uid");

-- AddForeignKey
ALTER TABLE "PromoterCode" ADD CONSTRAINT "PromoterCode_promoter_id_fkey" FOREIGN KEY ("promoter_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_promoter_code_id_fkey" FOREIGN KEY ("promoter_code_id") REFERENCES "PromoterCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
