/*
  Warnings:

  - You are about to drop the column `email_body` on the `NotificationMessageQueue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NotificationMessageQueue" DROP COLUMN "email_body",
ADD COLUMN     "template_code" TEXT;
