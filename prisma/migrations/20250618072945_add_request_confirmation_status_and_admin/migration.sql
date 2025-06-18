-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "request_confirmation_admin_id" TEXT,
ADD COLUMN     "request_confirmation_status" TEXT;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_request_confirmation_admin_id_fkey" FOREIGN KEY ("request_confirmation_admin_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
