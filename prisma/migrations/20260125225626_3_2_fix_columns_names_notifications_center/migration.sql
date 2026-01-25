/*
  Warnings:

  - You are about to drop the column `temlate_type` on the `NotificationEmailTemplates` table. All the data in the column will be lost.
  - You are about to drop the column `temlate_type` on the `NotificationMessageQueue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NotificationEmailTemplates" DROP COLUMN "temlate_type",
ADD COLUMN     "template_type" "TemplateTypes" NOT NULL DEFAULT 'EVENT_NOTIFICATION';

-- AlterTable
ALTER TABLE "NotificationMessageQueue" DROP COLUMN "temlate_type",
ADD COLUMN     "template_type" "TemplateTypes" NOT NULL DEFAULT 'EVENT_NOTIFICATION';
