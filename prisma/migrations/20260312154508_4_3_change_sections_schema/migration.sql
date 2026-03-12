/*
  Warnings:

  - The primary key for the `RoleSectionPermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `permission_id` on the `RoleSectionPermission` table. All the data in the column will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RoleSectionPermission" DROP CONSTRAINT "RoleSectionPermission_permission_id_fkey";

-- AlterTable
ALTER TABLE "RoleSectionPermission" DROP CONSTRAINT "RoleSectionPermission_pkey",
DROP COLUMN "permission_id",
ADD COLUMN     "can_create" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "can_delete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "can_edit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "can_export" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "can_view" BOOLEAN NOT NULL DEFAULT false,
ADD CONSTRAINT "RoleSectionPermission_pkey" PRIMARY KEY ("role", "section_id");

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Permission";
