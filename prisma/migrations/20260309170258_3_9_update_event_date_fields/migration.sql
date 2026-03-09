-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "commission_percentage" DOUBLE PRECISION,
ADD COLUMN     "date_checkin_close" TIMESTAMP(3),
ADD COLUMN     "date_checkin_open" TIMESTAMP(3),
ADD COLUMN     "date_end_event" TIMESTAMP(3),
ALTER COLUMN "date_event" DROP DEFAULT;
