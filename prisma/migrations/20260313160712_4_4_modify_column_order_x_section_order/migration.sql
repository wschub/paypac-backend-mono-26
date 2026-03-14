/*
  Warnings:

  - You are about to drop the column `order` on the `Section` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Section" DROP COLUMN "order",
ADD COLUMN     "section_order" INTEGER NOT NULL DEFAULT 0;

-- Agregar section_order sin intentar eliminar order (ya no existe)
ALTER TABLE "Section" ADD COLUMN IF NOT EXISTS "section_order" INTEGER NOT NULL DEFAULT 0;
