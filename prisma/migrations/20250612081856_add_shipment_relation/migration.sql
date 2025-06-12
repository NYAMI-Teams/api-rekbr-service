-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "courier_id" TEXT NOT NULL,
    "tracking_number" TEXT NOT NULL,
    "shipment_date" TIMESTAMP(3) NOT NULL,
    "received_date" TIMESTAMP(3),
    "photo_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourierList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CourierList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_transaction_id_key" ON "Shipment"("transaction_id");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "CourierList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
