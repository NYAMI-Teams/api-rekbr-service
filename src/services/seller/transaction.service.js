import throwError from "../../utils/throwError.js";
import transactionRepo from "../../repositories/transaction.repository.js";
import fundReleaseRequestRepository from "../../repositories/fund-release-request.repository.js";
import digitalStorageService from "../digital-storage.service.js";

const getTransactionDetailBySeller = async (transactionId, sellerId) => {
  const txn = await transactionRepo.getTransactionDetailBySeller(
    transactionId,
    sellerId
  );
  if (!txn) throwError("Transaksi tidak ditemukan atau bukan milik Anda", 404);

  return {
    id: txn.id,
    transactionCode: txn.transaction_code,
    status: txn.status,
    itemName: txn.item_name,
    itemPrice: txn.item_price,
    insuranceFee: txn.insurance_fee,
    platformFee: txn.platform_fee,
    totalAmount: txn.total_amount,
    virtualAccount: txn.virtual_account_number,
    buyerEmail: txn.buyer?.email || null,
    createdAt: txn.created_at,
    paidAt: txn.paid_at,
    paymentDeadline: txn.payment_deadline,
    shipmentDeadline: txn.shipment_deadline,
    shipmentDate: txn.paid_at
      ? new Date(txn.paid_at.getTime() + 86400000).toISOString()
      : null,
    shipment: {
      trackingNumber: "DUMMY-TRACK",
      courier: "JNE REG",
    },
    fundReleaseRequest: {
      requested: true,
      status: "approved",
      requestedAt: new Date().toISOString(),
      resolvedAt: new Date(Date.now() + 3600000).toISOString(),
    },
    buyerConfirmedAt: txn.confirmed_at,
    rekeningSeller: {
      bankName: txn.withdrawal_bank_account?.bank?.bank_name || null,
      accountNumber: txn.withdrawal_bank_account?.account_number || null,
      logoUrl: txn.withdrawal_bank_account?.bank?.logo_url || null,
    },
    currentTimestamp: new Date().toISOString(),
  };
};

const confirmationShipmentRequest = async ({transactionId, sellerId, evidence, reason}) => {
  const txn = await transactionRepo.getTransactionDetailBySeller(
    transactionId,
    sellerId
  );
  if (!txn) throwError("Transaksi tidak ditemukan atau bukan milik Anda", 404);

  if (txn.status !== "waiting_shipment") {
    throwError("Gagal meminta konfirmasi", 400);
  }

  const evidenceUrl = await digitalStorageService.uploadToSpaces(evidence.buffer, evidence.originalname, evidence.mimetype);

  const payload = {
    transactionId,
    sellerId,
    evidenceUrl,
    reason,
  };

  console.log(payload);

  await fundReleaseRequestRepository.createFundReleaseRequest(payload);
}

export default {
  getTransactionDetailBySeller,
  confirmationShipmentRequest,
};
