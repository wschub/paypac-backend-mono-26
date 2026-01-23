/*
  Warnings:

  - The `ev_status` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "ev_status",
ADD COLUMN     "ev_status" "EVENT_STATUS" NOT NULL DEFAULT 'CREATED';

-- DropEnum
DROP TYPE "EventStatus";
