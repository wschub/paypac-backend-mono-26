-- AlterTable
ALTER TABLE "EventStaffAssignment" ADD COLUMN     "invitation_pending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invited_contact" TEXT;
