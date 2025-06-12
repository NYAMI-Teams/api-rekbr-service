import throwError from "../../utils/throwError.js";
import transactionRepo from "../../repositories/transaction.repository.js";

const getTransactionDetailByBuyer = async (transactionId, buyerId) => {
  const txn = await transactionRepo.getTransactionDetailByBuyer(
    transactionId,
    buyerId
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
    sellerEmail: txn.seller?.email || null,
    createdAt: txn.created_at,
    paidAt: txn.paid_at,
    shipmentDeadline: txn.shipment_deadline,
    shipmentDate: txn.paid_at
      ? new Date(txn.paid_at.getTime() + 86400000).toISOString()
      : null,
    shipment: {
      trackingNumber: "2345523123JUJ",
      courier: "J&T Express Indonesia",
    },
    fundReleaseRequest: {
      requested: true,
      status: "rejected",
      requestedAt: new Date().toISOString(),
      resolvedAt: new Date(Date.now() + 3600000).toISOString(),
    },
    buyerConfirmDeadline: txn.shipment_deadline,
    buyerConfirmedAt: txn.confirmed_at,
    currentTimestamp: new Date().toISOString(),
  };
};

export default {
  getTransactionDetailByBuyer,
};
