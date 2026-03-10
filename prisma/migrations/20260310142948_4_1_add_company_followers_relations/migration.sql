-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "first_name_user" TEXT,
ADD COLUMN     "last_name_user" TEXT,
ADD COLUMN     "read_by_user" INTEGER;

-- CreateTable
CREATE TABLE "CompanyFollwers" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyFollwers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyFollwers_company_id_idx" ON "CompanyFollwers"("company_id");

-- CreateIndex
CREATE INDEX "CompanyFollwers_user_id_idx" ON "CompanyFollwers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyFollwers_company_id_user_id_key" ON "CompanyFollwers"("company_id", "user_id");

-- AddForeignKey
ALTER TABLE "CompanyFollwers" ADD CONSTRAINT "CompanyFollwers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFollwers" ADD CONSTRAINT "CompanyFollwers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
