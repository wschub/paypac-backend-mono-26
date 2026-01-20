-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_user_id_register_fkey";

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "user_id_register" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_user_id_register_fkey" FOREIGN KEY ("user_id_register") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
