-- AlterTable
ALTER TABLE "User" ADD COLUMN "uniqueCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_uniqueCode_key" ON "User"("uniqueCode");
