import throwError from "../../utils/throwError.js";
import transactionRepo from "../../repositories/transaction.repository.js";
import fundReleaseRequestRepository from "../../repositories/fund-release-request.repository.js";
import { transactionQueue } from "../../queues/transaction.queue.js";

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
    Complaint: txn.Complaint.length > 0
    ? txn.Complaint.map((c) => ({
        id: c.id,
        transactionId: c.transaction_id,
        buyerId: c.buyer_id,
        type: c.type,
        status: c.status,
        buyerReason: c.buyer_reason,
        buyerEvidenceUrls: c.buyer_evidence_urls,
        sellerResponseReason: c.seller_response_reason,
        sellerEvidenceUrls: c.seller_evidence_urls,
        buyerRequestedConfirmationAt: c.buyer_requested_confirmation_at,
        buyerRequestedConfirmationReason: c.buyer_requested_confirmation_reason,
        buyerRequestedConfirmationEvidenceUrls: c.buyer_requested_confirmation_evidence_urls,
        requestConfirmationStatus: c.request_confirmation_status,
        requestConfirmationAdminId: c.request_confirmation_admin_id,
        sellerConfirmDeadline: c.seller_confirm_deadline,
        resolvedAt: c.resolved_at,
        returnShipment: c.return_shipment
        ? {
          id: c.return_shipment.id,
          trackingNumber: c.return_shipment.tracking_number,
          courierName: c.return_shipment.courier?.name || null,
          shipmentDate: c.return_shipment.shipment_date?.toISOString() || null,
        } : null,
        returnShipmentTrackingNumber: c.return_shipment_tracking_number,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }))
    : null,
    buyerConfirmDeadline: txn.buyer_confirm_deadline || null,
    buyerConfirmedAt: txn.confirmed_at || null,
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

  await transactionQueue.remove(`cancel:${transactionId}`);

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

const getTransactionListByBuyer = async (buyerId, statusArray) => {
  const txn = await transactionRepo.getTransactionListForBuyer(
    buyerId,
    statusArray
  );
  // Return empty array if no transactions (no throw)
  if (!txn || txn.length === 0) {
    return [];
  }

  const transactionsWithFR = await Promise.all(
    txn.map(async (txn) => {
      const fr =
        await fundReleaseRequestRepository.getFundReleaseRequestByTransaction(
          txn.id
        );

      return {
        id: txn.id,
        transactionCode: txn.transaction_code,
        itemName: txn.item_name,
        totalAmount: txn.total_amount,
        sellerEmail: txn.seller?.email || "-",
        virtualAccount: txn.virtual_account_number,
        status: txn.status,
        paymentDeadline: txn.payment_deadline,
        shipmentDeadline: txn.shipment_deadline,
        currentTimestamp: new Date().toISOString(),
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
            },
        fundReleaseRequest: fr
          ? {
              requested: true,
              status: fr.status,
              requestedAt: fr.created_at.toISOString(),
              resolvedAt: fr.resolved_at?.toISOString() || null,
              adminEmail: fr.admin?.email || null,
            }
          : {
              requested: false,
              status: null,
              requestedAt: null,
              resolvedAt: null,
              adminEmail: null,
            },
        buyerConfirmDeadline: txn.buyer_confirm_deadline || null,
        buyerConfirmedAt: txn.confirmed_at || null,
        currentTimestamp: new Date().toISOString(),
      };
    })
  );

  return transactionsWithFR;
};

export default {
  getTransactionDetailByBuyer,
  simulatePayment,
  confirmReceived,
  getTransactionListByBuyer,
};
