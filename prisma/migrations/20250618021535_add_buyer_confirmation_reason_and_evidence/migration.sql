-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "buyer_requested_confirmation_evidence_urls" JSONB,
ADD COLUMN     "buyer_requested_confirmation_reason" TEXT,
ADD COLUMN     "seller_confirm_deadline" TIMESTAMP(3);
