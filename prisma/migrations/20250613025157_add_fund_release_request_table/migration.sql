-- CreateTable
CREATE TABLE "FundReleaseRequest" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "evidence_url" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "admin_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "FundReleaseRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FundReleaseRequest" ADD CONSTRAINT "FundReleaseRequest_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundReleaseRequest" ADD CONSTRAINT "FundReleaseRequest_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundReleaseRequest" ADD CONSTRAINT "FundReleaseRequest_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
