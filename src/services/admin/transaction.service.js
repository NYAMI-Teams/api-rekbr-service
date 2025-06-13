// services/admin/transaction.service.js

import throwError from "../../utils/throwError.js";
import transactionRepo from "../../repositories/transaction.repository.js";

const getTransactionDetailByAdmin = async (transactionId) => {
  const txn = await transactionRepo.getTransactionDetailByAdmin(transactionId);
  if (!txn) throwError("Transaksi tidak ditemukan", 404);

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
    sellerEmail: txn.seller?.email || null,
    buyerEmail: txn.buyer?.email || null,
    createdAt: txn.created_at,
    paidAt: txn.paid_at,
    paymentDeadline: txn.payment_deadline,
    shipmentDeadline: txn.shipment_deadline,
    shipment: txn.shipment
      ? {
          trackingNumber: txn.shipment.tracking_number,
          courier: txn.shipment.courier?.name || null,
          shipmentDate: txn.shipment.shipment_date?.toISOString() || null,
          photoUrl: txn.shipment.photo_url || null,
        }
      : {
          trackingNumber: null,
          courier: null,
          shipmentDate: null,
          photoUrl: null,
        },
    withdrawalBank: txn.withdrawal_bank_account
      ? {
          bankName: txn.withdrawal_bank_account.bank?.bank_name || null,
          accountNumber: txn.withdrawal_bank_account.account_number || null,
          logoUrl: txn.withdrawal_bank_account.bank?.logo_url || null,
        }
      : {
          bankName: null,
          accountNumber: null,
          logoUrl: null,
        },
    fundReleaseRequest: {
      requested: true,
      status: "approved",
      evidenceUrl: "https://example.com/evidence.jpg", // Simulated evidence URL
      requestedAt: new Date().toISOString(),
      resolvedAt: new Date(Date.now() + 3600000).toISOString(),
    },
    buyerConfirmDeadline: txn.shipment_deadline, // Nanti diubah jadi value saat admin approve
    buyerConfirmedAt: txn.confirmed_at,
    currentTimestamp: new Date().toISOString(),
  };
};

const getAllTransactionsForAdmin = async () => {
  const txns = await transactionRepo.getAllTransactionsForAdmin();
  return txns.map((txn) => ({
    id: txn.id,
    transactionCode: txn.transaction_code,
    itemName: txn.item_name,
    itemPrice: txn.item_price,
    totalAmount: txn.total_amount,
    buyerEmail: txn.buyer?.email || null,
    sellerEmail: txn.seller?.email || null,
    status: txn.status,
    createdAt: txn.created_at,
    fundReleaseStatus: "pending", // mock until table exists
  }));
};

export default {
  getTransactionDetailByAdmin,
  getAllTransactionsForAdmin,
};
