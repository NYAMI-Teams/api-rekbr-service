import throwError from "../../utils/throwError.js";
import transactionRepo from "../../repositories/transaction.repository.js";
import shipmentRepo from "../../repositories/shipment.repository.js";
import fundReleaseRequestRepository from "../../repositories/fund-release-request.repository.js";
import digitalStorageService from "../digital-storage.service.js";
import userService from "../user.service.js";
import { transactionQueue } from "../../queues/transaction.queue.js";

const getTransactionDetailBySeller = async (transactionId, sellerId) => {
  const txn = await transactionRepo.getTransactionDetailBySeller(
    transactionId,
    sellerId
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
        },
    rekeningSeller: {
      bankName: txn.withdrawal_bank_account?.bank?.bank_name || null,
      accountNumber: txn.withdrawal_bank_account?.account_number || null,
      logoUrl: txn.withdrawal_bank_account?.bank?.logo_url || null,
    },
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
    buyerConfirmDeadline: txn.buyer_confirm_deadline,
    buyerConfirmedAt: txn.confirmed_at,
    currentTimestamp: new Date().toISOString(),
  };
};

const getTransactionListBySeller = async (sellerId, isHistory=null) => {
  // Convert isHistory to a boolean if it's a string
  if (typeof isHistory === "string") {
    isHistory = isHistory.toLowerCase() === "true";
  }
  
  const txn = await transactionRepo.getTransactionListForSeller(sellerId, isHistory);
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
        buyerEmail: txn.buyer?.email || "-",
        virtualAccount: txn.virtual_account_number,
        status: txn.status,
        createdAt: txn.created_at,
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
          : {
              requested: false,
              status: null,
              requestedAt: null,
              resolvedAt: null,
              adminEmail: null,
            },
        buyerConfirmDeadline: txn.buyer_confirm_deadline || null,
        buyerConfirmedAt: txn.confirmed_at || null,
      };
    })
  );

  return transactionsWithFR;
};

const generateTransactionCode = () => {
  const prefix = "TRX";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
};

const generateVirtualAccountNumber = () => {
  const prefix = "888";
  const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);
  return `${prefix}${randomNumber}`;
};

const scheduleAutoCancelTransaction = async (
  transactionId,
  paymentDeadline
) => {
  const deadlineTime = new Date(paymentDeadline).getTime();
  const now = Date.now();
  const delay = deadlineTime - now;

  if (isNaN(deadlineTime) || delay <= 0) {
    console.warn(
      `⚠️ Tidak dapat menjadwalkan auto-cancel: deadline tidak valid atau telah lewat.`
    );
    return;
  }

  await transactionQueue.add(
    "auto-cancel-payment",
    { transactionId },
    {
      delay,
      jobId: `cancel:${transactionId}`, // ✅ pakai backtick
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  console.log(
    `📌 Job auto-cancel transaksi ${transactionId} dijadwalkan dalam ${delay} ms`
  );
};

const generateTransaction = async ({
  seller_id,
  item_name,
  item_price,
  withdrawal_bank_account_id,
  email,
  isInsurance,
}) => {
  const buyer = await userService.checkEmail({ email });
  const buyer_id = buyer.id;

  // plt fee, insurance fee, dan total amount are hardcoded for simplicity
  let platform_fee = 0;
  if (item_price >= 10000 && item_price < 499999) {
    platform_fee = 5000;
  } else if (item_price >= 500000 && item_price < 4999999) {
    platform_fee = item_price * 0.01;
  } else if (item_price >= 5000000) {
    platform_fee = item_price * 0.008;
  } else {
    throwError("Harga item tidak valid untuk transaksi", 400);
  }

  // Insurance fee calculation
  const insurance =
    typeof isInsurance === "string"
      ? isInsurance.toLowerCase() === "true"
      : !!isInsurance;

  const insurance_fee = insurance ? 0.002 * item_price : 0;

  // Total amount calculation
  const total_amount = item_price + platform_fee + insurance_fee;

  //payment deadline also hardocdeed
  const payment_deadline = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const created_at = new Date(Date.now());

  //status is hardcoded to pending_payment
  const status = "pending_payment";
  const virtual_account_number = generateVirtualAccountNumber();

  const existingTransaction = await transactionRepo.findActiveTransaction({
    seller_id,
    buyer_id,
  });
  if (existingTransaction) {
    throwError(
      "Transaksi aktif sudah ada untuk seller dan buyer ini dengan ID ${existingTransaction.transactionCode}",
      400
    );
  }
  const transaction_code = generateTransactionCode();

  const newTransaction = await transactionRepo.createTransaction({
    transaction_code,
    seller_id,
    buyer_id,
    item_name,
    item_price,
    platform_fee,
    insurance_fee,
    total_amount,
    status,
    virtual_account_number,
    payment_deadline,
    withdrawal_bank_account_id,
    created_at,
  });

  await scheduleAutoCancelTransaction(newTransaction.id, payment_deadline);

  return newTransaction;
};

const inputShipment = async (
  transactionId,
  sellerId,
  courierId,
  trackingNumber,
  photo
) => {
  const transaction = await transactionRepo.getTransactionDetailBySeller(
    transactionId,
    sellerId
  );

  if (!transaction) throwError("Transaksi tidak ditemukan", 404);

  if (transaction.status !== "waiting_shipment")
    throwError("Transaksi belum bisa dikirim", 400);

  const photoUrl = await digitalStorageService.uploadToSpaces(
    photo.buffer,
    photo.originalname,
    photo.mimetype
  );

  await shipmentRepo.createShipment({
    transactionId,
    courierId,
    trackingNumber,
    photoUrl,
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

const confirmationShipmentRequest = async ({
  transactionId,
  sellerId,
  evidence,
  reason,
}) => {
  const txn = await transactionRepo.getTransactionDetailBySeller(
    transactionId,
    sellerId
  );
  if (!txn) throwError("Transaksi tidak ditemukan atau bukan milik Anda", 404);

  if (txn.status !== "shipped") {
    throwError("Gagal meminta konfirmasi barang belum dikirim", 400);
  }

  // Check the latest fund release request for the transaction
  const latestFundReleaseRequest =
    await fundReleaseRequestRepository.getFundReleaseRequestByTransaction(
      transactionId
    );

  if (latestFundReleaseRequest) {
    if (latestFundReleaseRequest.status === "pending") {
      throwError(
        "Permintaan konfirmasi pengiriman tidak dapat dibuat karena permintaan sebelumnya belum selesai",
        400
      );
    }
  }

  const evidenceUrl = await digitalStorageService.uploadToSpaces(
    evidence.buffer,
    evidence.originalname,
    evidence.mimetype
  );

  const payload = {
    transactionId,
    sellerId,
    evidenceUrl,
    reason,
  };

  console.log(payload);

  await fundReleaseRequestRepository.createFundReleaseRequest(payload);
};

const courierList = async () => {
  const couriers = await shipmentRepo.getCourier();
  if (!couriers || couriers.length === 0) {
    throwError("Daftar kurir tidak ditemukan", 404);
  }
  return couriers.map((courier) => ({
    id: courier.id,
    name: courier.name,
  }));
};

export default {
  getTransactionDetailBySeller,
  inputShipment,
  cancelTransactionBySeller,
  confirmationShipmentRequest,
  getTransactionDetailBySeller,
  generateTransaction,
  generateTransactionCode,
  getTransactionListBySeller,
  courierList,
};
