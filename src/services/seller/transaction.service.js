import throwError from "../../utils/throwError.js";
import transactionRepo from "../../repositories/transaction.repository.js";
import shipmentRepo from "../../repositories/shipment.repository.js";

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
    fundReleaseRequest: {
      requested: true,
      status: "approved",
      requestedAt: new Date().toISOString(),
      resolvedAt: new Date(Date.now() + 3600000).toISOString(),
    },
    rekeningSeller: {
      bankName: txn.withdrawal_bank_account?.bank?.bank_name || null,
      accountNumber: txn.withdrawal_bank_account?.account_number || null,
      logoUrl: txn.withdrawal_bank_account?.bank?.logo_url || null,
    },
    buyerConfirmDeadline: txn.shipment_deadline, // nanti diubah jadi value saat admin approve
    buyerConfirmedAt: txn.confirmed_at,
    currentTimestamp: new Date().toISOString(),
  };
};

const inputShipment = async (transactionId, sellerId, data) => {
  const transaction = await transactionRepo.getTransactionDetailBySeller(
    transactionId,
    sellerId
  );
  if (!transaction) throwError("Transaksi tidak ditemukan", 404);

  if (transaction.status !== "waiting_shipment")
    throwError("Transaksi belum bisa dikirim", 400);

  await shipmentRepo.createShipment({
    transactionId,
    courierId: data.courierId,
    trackingNumber: data.trackingNumber,
    photoUrl: data.photoUrl,
  });

  await transactionRepo.updateStatusToShipped(transactionId);

  return { success: true };
};

const cancelTransactionBySeller = async (transactionId, sellerId) => {
  const result = await transactionRepo.cancelTransactionBySeller(
    transactionId,
    sellerId
  );

  if (result.count === 0) {
    throwError(
      "Transaksi tidak dapat dibatalkan. Mungkin sudah dikirim atau bukan milik Anda.",
      400
    );
  }

  return { success: true };
};

export default {
  getTransactionDetailBySeller,
  inputShipment,
  cancelTransactionBySeller,
};
