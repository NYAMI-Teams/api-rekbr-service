-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "admin_approved_confirmation_at" TIMESTAMP(3),
ADD COLUMN     "admin_responded_at" TIMESTAMP(3),
ADD COLUMN     "seller_confirmed_return_at" TIMESTAMP(3);
