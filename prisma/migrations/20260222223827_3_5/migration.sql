/*
  Warnings:

  - You are about to drop the column `description` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Permission` table. All the data in the column will be lost.
  - The `role_id` column on the `RoleSectionPermission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CompanyUserApproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCompanyRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryToEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventToSubCategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[permission_name]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `permission_name` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CompanyUserApproval" DROP CONSTRAINT "CompanyUserApproval_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "CompanyUserApproval" DROP CONSTRAINT "CompanyUserApproval_company_id_fkey";

-- DropForeignKey
ALTER TABLE "CompanyUserApproval" DROP CONSTRAINT "CompanyUserApproval_user_id_fkey";

-- DropForeignKey
ALTER TABLE "RoleSectionPermission" DROP CONSTRAINT "RoleSectionPermission_role_id_fkey";

-- DropForeignKey
ALTER TABLE "UserCompanyRole" DROP CONSTRAINT "UserCompanyRole_company_id_fkey";

-- DropForeignKey
ALTER TABLE "UserCompanyRole" DROP CONSTRAINT "UserCompanyRole_role_id_fkey";

-- DropForeignKey
ALTER TABLE "UserCompanyRole" DROP CONSTRAINT "UserCompanyRole_user_id_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToEvent" DROP CONSTRAINT "_CategoryToEvent_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToEvent" DROP CONSTRAINT "_CategoryToEvent_B_fkey";

-- DropForeignKey
ALTER TABLE "_EventToSubCategory" DROP CONSTRAINT "_EventToSubCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventToSubCategory" DROP CONSTRAINT "_EventToSubCategory_B_fkey";

-- DropIndex
DROP INDEX "Permission_name_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "category_icon" TEXT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "comapny_cover" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "category_id" INTEGER,
ADD COLUMN     "subcategory_id" INTEGER,
ADD COLUMN     "subgenre_id" INTEGER;

-- AlterTable
ALTER TABLE "EventLocalities" ADD COLUMN     "num_max_tickets" INTEGER DEFAULT 0,
ADD COLUMN     "num_tickets_sold" INTEGER DEFAULT 0,
ADD COLUMN     "require_num_tickets" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "EventStaffAssignment" ADD COLUMN     "door_identifier" TEXT;

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "permission_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RoleSectionPermission" DROP COLUMN "role_id",
ADD COLUMN     "role_id" "ROLES" NOT NULL DEFAULT 'PAYPAC';

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "parent_id" INTEGER;

-- DropTable
DROP TABLE "CompanyUserApproval";

-- DropTable
DROP TABLE "Roles";

-- DropTable
DROP TABLE "UserCompanyRole";

-- DropTable
DROP TABLE "_CategoryToEvent";

-- DropTable
DROP TABLE "_EventToSubCategory";

-- CreateIndex
CREATE UNIQUE INDEX "Permission_permission_name_key" ON "Permission"("permission_name");

-- CreateIndex
CREATE UNIQUE INDEX "RoleSectionPermission_role_id_section_id_permission_id_key" ON "RoleSectionPermission"("role_id", "section_id", "permission_id");

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_subgenre_id_fkey" FOREIGN KEY ("subgenre_id") REFERENCES "Subgenre"("id") ON DELETE SET NULL ON UPDATE CASCADE;
