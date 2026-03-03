/*
  Warnings:

  - The `map_place` column on the `EventPlaces` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `RoleSectionPermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `RoleSectionPermission` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `RoleSectionPermission` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the `EventPlacesSeats` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[link]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `place_type` to the `EventPlaces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EventPlaces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `RoleSectionPermission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('ACTIVE', 'BLOCKED_MAINTENANCE');

-- CreateEnum
CREATE TYPE "SeatEventStatus" AS ENUM ('AVAILABLE', 'HELD', 'SOLD', 'BLOCKED');

-- DropForeignKey
ALTER TABLE "EventPlacesSeats" DROP CONSTRAINT "EventPlacesSeats_place_id_fkey";

-- DropIndex
DROP INDEX "RoleSectionPermission_role_id_section_id_permission_id_key";

-- AlterTable
ALTER TABLE "EventPlaces" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "place_type" "Places" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "map_place",
ADD COLUMN     "map_place" JSONB;

-- AlterTable
ALTER TABLE "RoleSectionPermission" DROP CONSTRAINT "RoleSectionPermission_pkey",
DROP COLUMN "id",
DROP COLUMN "role_id",
ADD COLUMN     "role" "ROLES" NOT NULL,
ADD CONSTRAINT "RoleSectionPermission_pkey" PRIMARY KEY ("role", "section_id", "permission_id");

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "description";

-- DropTable
DROP TABLE "EventPlacesSeats";

-- CreateTable
CREATE TABLE "EventPlaceZone" (
    "id" SERIAL NOT NULL,
    "place_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "EventPlaceZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPlaceRow" (
    "id" SERIAL NOT NULL,
    "zone_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EventPlaceRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPlaceSeat" (
    "id" SERIAL NOT NULL,
    "row_id" INTEGER NOT NULL,
    "seat_number" TEXT NOT NULL,
    "status" "SeatStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "EventPlaceSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSeatStatus" (
    "id" SERIAL NOT NULL,
    "seat_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "status" "SeatEventStatus" NOT NULL DEFAULT 'AVAILABLE',
    "held_until" TIMESTAMP(3),

    CONSTRAINT "EventSeatStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventPlaceZone_place_id_idx" ON "EventPlaceZone"("place_id");

-- CreateIndex
CREATE INDEX "EventPlaceRow_zone_id_idx" ON "EventPlaceRow"("zone_id");

-- CreateIndex
CREATE INDEX "EventPlaceSeat_row_id_idx" ON "EventPlaceSeat"("row_id");

-- CreateIndex
CREATE INDEX "EventPlaceSeat_status_idx" ON "EventPlaceSeat"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EventPlaceSeat_row_id_seat_number_key" ON "EventPlaceSeat"("row_id", "seat_number");

-- CreateIndex
CREATE INDEX "EventSeatStatus_event_id_status_idx" ON "EventSeatStatus"("event_id", "status");

-- CreateIndex
CREATE INDEX "EventSeatStatus_event_id_idx" ON "EventSeatStatus"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "EventSeatStatus_seat_id_event_id_key" ON "EventSeatStatus"("seat_id", "event_id");

-- CreateIndex
CREATE INDEX "EventPlaces_type_place_idx" ON "EventPlaces"("type_place");

-- CreateIndex
CREATE INDEX "RoleSectionPermission_role_idx" ON "RoleSectionPermission"("role");

-- CreateIndex
CREATE INDEX "RoleSectionPermission_role_section_id_idx" ON "RoleSectionPermission"("role", "section_id");

-- CreateIndex
CREATE UNIQUE INDEX "Section_link_key" ON "Section"("link");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_numbered_place_id_fkey" FOREIGN KEY ("numbered_place_id") REFERENCES "EventPlaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlaceZone" ADD CONSTRAINT "EventPlaceZone_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "EventPlaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlaceRow" ADD CONSTRAINT "EventPlaceRow_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "EventPlaceZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPlaceSeat" ADD CONSTRAINT "EventPlaceSeat_row_id_fkey" FOREIGN KEY ("row_id") REFERENCES "EventPlaceRow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSeatStatus" ADD CONSTRAINT "EventSeatStatus_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "EventPlaceSeat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSeatStatus" ADD CONSTRAINT "EventSeatStatus_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
