/*
  Warnings:

  - You are about to drop the column `locality_id` on the `EventFavorites` table. All the data in the column will be lost.
  - You are about to drop the column `price_ticket` on the `EventFavorites` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventFavorites" DROP CONSTRAINT "EventFavorites_locality_id_fkey";

-- AlterTable
ALTER TABLE "EventFavorites" DROP COLUMN "locality_id",
DROP COLUMN "price_ticket";
