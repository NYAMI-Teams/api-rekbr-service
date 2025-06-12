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
    paymentDeadline: txn.payment_deadline,
    shipmentDeadline: txn.shipment_deadline,
    shipment: txn.shipment
      ? {
          trackingNumber: txn.shipment.tracking_number,
          courier: txn.shipment.courier?.name || null,
          shipmentDate: txn.shipment.shipment_date?.toISOString() || null,
          photoUrl: txn.shipment.photo_url || null,
        }
      : null,
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

const simulatePayment = async (transactionId, buyerId) => {
  const paidAt = new Date();
  const shipmentDeadline = new Date(paidAt.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 hari

  const updated = await transactionRepo.updatePaidTransaction(
    transactionId,
    buyerId,
    paidAt,
    shipmentDeadline
  );
  if (updated.count === 0)
    throwError("Transaksi tidak ditemukan atau bukan milik Anda", 404);

  return {
    transactionCode: transactionId,
    status: "waiting_shipment",
    paidAt: paidAt.toISOString(),
    shipmentDeadline: shipmentDeadline.toISOString(),
  };
};

export default {
  getTransactionDetailByBuyer,
  simulatePayment,
};
