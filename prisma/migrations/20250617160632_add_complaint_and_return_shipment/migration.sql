-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "buyer_evidence_urls" JSONB,
    "seller_response" TEXT,
    "seller_evidence_urls" JSONB,
    "buyer_requested_confirmation_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnShipment" (
    "id" TEXT NOT NULL,
    "complaint_id" TEXT NOT NULL,
    "courier_id" TEXT NOT NULL,
    "tracking_number" TEXT NOT NULL,
    "shipment_date" TIMESTAMP(3) NOT NULL,
    "received_date" TIMESTAMP(3),
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnShipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_transaction_id_key" ON "Complaint"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnShipment_complaint_id_key" ON "ReturnShipment"("complaint_id");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnShipment" ADD CONSTRAINT "ReturnShipment_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "Complaint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnShipment" ADD CONSTRAINT "ReturnShipment_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "CourierList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
