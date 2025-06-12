-- CreateTable
CREATE TABLE "DummyAccount" (
    "id" TEXT NOT NULL,
    "bank_id" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,

    CONSTRAINT "DummyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bank_id" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_holder_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DummyAccount" ADD CONSTRAINT "DummyAccount_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "BankList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "BankList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
