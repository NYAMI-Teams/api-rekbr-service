-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "transaction_code" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "item_price" INTEGER NOT NULL,
    "platform_fee" INTEGER NOT NULL,
    "insurance_fee" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "virtual_account_number" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3),
    "payment_deadline" TIMESTAMP(3),
    "shipment_deadline" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "withdrawal_bank_account_id" TEXT,
    "withdrawn_at" TIMESTAMP(3),
    "withdrawn_amount" INTEGER,
    "cancelled_at" TIMESTAMP(3),
    "cancelled_by_id" TEXT,
    "cancel_reason" TEXT,
    "refunded_at" TIMESTAMP(3),
    "refund_amount" INTEGER,
    "refund_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transaction_code_key" ON "Transaction"("transaction_code");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_withdrawal_bank_account_id_fkey" FOREIGN KEY ("withdrawal_bank_account_id") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
