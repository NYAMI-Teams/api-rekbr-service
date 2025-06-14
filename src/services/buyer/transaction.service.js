import throwError from "../../utils/throwError.js";
import transactionRepo from "../../repositories/transaction.repository.js";
import fundReleaseRequestRepository from "../../repositories/fund-release-request.repository.js";

const getTransactionDetailByBuyer = async (transactionId, buyerId) => {
  const txn = await transactionRepo.getTransactionDetailByBuyer(
    transactionId,
    buyerId
  );
  if (!txn) throwError("Transaksi tidak ditemukan atau bukan milik Anda", 404);

  const fr =
    await fundReleaseRequestRepository.getFundReleaseRequestByTransaction(
      transactionId
    );

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
      : {
          trackingNumber: null,
          courier: null,
          shipmentDate: null,
          photoUrl: null,
        },
    fundReleaseRequest: fr
      ? {
          requested: true,
          status: fr.status,
          requestedAt: fr.created_at.toISOString(),
          resolvedAt: fr.resolved_at?.toISOString() || null,
          adminEmail: fr.admin?.email || null,
        }
      : { requested: false, status: null, requestedAt: null, resolvedAt: null },
    buyerConfirmDeadline: txn.buyer_confirm_deadline,
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

const confirmReceived = async (transactionId, buyerId) => {
  const confirmedAt = new Date();

  const txn = await transactionRepo.getTransactionDetailByBuyer(
    transactionId,
    buyerId
  );
  if (!txn || txn.status !== "shipped") {
    throwError("Transaksi tidak ditemukan atau belum dikirim", 404);
  }

  const amountToWithdraw =
    txn.total_amount - txn.platform_fee - txn.insurance_fee;

  const result = await transactionRepo.updateAfterBuyerConfirmation(
    transactionId,
    buyerId,
    confirmedAt,
    amountToWithdraw
  );

  if (result.count === 0) {
    throwError("Gagal mengkonfirmasi penerimaan barang", 400);
  }

  return {
    success: true,
    confirmedAt,
  };
};

export default {
  getTransactionDetailByBuyer,
  simulatePayment,
  confirmReceived,
};
