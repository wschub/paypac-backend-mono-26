/*
  Warnings:

  - The `role_type` column on the `EventStaffAssignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ROLES" AS ENUM ('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "TemplateTypes" AS ENUM ('REGISTRATION', 'PASSWORD_RESET', 'EVENT_NOTIFICATION', 'TRANSACTION', 'PROMOTER_UPDATE', 'MARKETING');

-- AlterEnum
ALTER TYPE "TicketStatus" ADD VALUE 'ON_SALE';

-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'ON_SALE';

-- AlterTable
ALTER TABLE "EventStaffAssignment" DROP COLUMN "role_type",
ADD COLUMN     "role_type" "ROLES" NOT NULL DEFAULT 'STAFF';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "ROLES" NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE "NotificationEmailTemplates" (
    "id" SERIAL NOT NULL,
    "template_name" TEXT NOT NULL,
    "template_subjet" TEXT NOT NULL,
    "template_code" TEXT NOT NULL,
    "temlate_type" "TemplateTypes" NOT NULL DEFAULT 'EVENT_NOTIFICATION',
    "template_variables" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationEmailTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationMessageQueue" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "template_id" INTEGER NOT NULL,
    "template_subjet" TEXT NOT NULL,
    "temlate_type" "TemplateTypes" NOT NULL DEFAULT 'EVENT_NOTIFICATION',
    "email_delivery" TEXT NOT NULL,
    "email_body" TEXT,
    "send_at" TIMESTAMP(3),
    "status" INTEGER NOT NULL DEFAULT 0,
    "message_result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationMessageQueue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotificationMessageQueue" ADD CONSTRAINT "NotificationMessageQueue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationMessageQueue" ADD CONSTRAINT "NotificationMessageQueue_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "NotificationEmailTemplates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
