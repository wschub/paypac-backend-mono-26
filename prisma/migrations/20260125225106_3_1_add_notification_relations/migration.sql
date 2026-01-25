/*
  Warnings:

  - You are about to drop the column `template_subjet` on the `NotificationEmailTemplates` table. All the data in the column will be lost.
  - You are about to drop the column `template_subjet` on the `NotificationMessageQueue` table. All the data in the column will be lost.
  - Added the required column `template_subject` to the `NotificationEmailTemplates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_subject` to the `NotificationMessageQueue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotificationEmailTemplates" DROP COLUMN "template_subjet",
ADD COLUMN     "template_subject" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "NotificationMessageQueue" DROP COLUMN "template_subjet",
ADD COLUMN     "template_subject" TEXT NOT NULL;
