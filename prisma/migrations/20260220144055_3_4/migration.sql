-- DropIndex
DROP INDEX "NotificationMessageQueue_template_code_idx";

-- AlterTable
ALTER TABLE "NotificationMessageQueue" ALTER COLUMN "template_code" SET DATA TYPE TEXT;
