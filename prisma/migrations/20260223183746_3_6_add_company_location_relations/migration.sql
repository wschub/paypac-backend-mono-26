/*
  Warnings:

  - You are about to drop the column `comapny_cover` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `users_id_approved` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "comapny_cover",
DROP COLUMN "users_id_approved",
ADD COLUMN     "company_cover" TEXT,
ADD COLUMN     "company_presentation" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "Countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "States"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "Cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
