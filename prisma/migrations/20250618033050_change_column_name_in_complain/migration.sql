/*
  Warnings:

  - You are about to drop the column `reason` on the `Complaint` table. All the data in the column will be lost.
  - You are about to drop the column `seller_response` on the `Complaint` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Complaint" DROP COLUMN "reason",
DROP COLUMN "seller_response",
ADD COLUMN     "buyer_reason" TEXT,
ADD COLUMN     "seller_response_reason" TEXT;
