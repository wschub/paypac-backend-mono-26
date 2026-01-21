/*
  Warnings:

  - You are about to drop the column `customer_token` on the `Ticket` table. All the data in the column will be lost.
  - The `status_ticket` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status_ticket` column on the `TicketTransaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Wallet` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'PAID', 'ACTIVE', 'USED', 'FROZEN', 'TRANSFERRED', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'FROZEN', 'PAID', 'ACCEPTED', 'RECEIVED', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "customer_token",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "used_at" TIMESTAMP(3),
DROP COLUMN "status_ticket",
ADD COLUMN     "status_ticket" "TicketStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "TicketTransaction" DROP COLUMN "status_ticket",
ADD COLUMN     "status_ticket" "TransactionStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "Wallet";
