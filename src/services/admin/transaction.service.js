import throwError from "../../utils/throwError.js";
import transactionRepo from "../../repositories/transaction.repository.js";
import fundReleaseRequestRepository from "../../repositories/fund-release-request.repository.js";
import { scheduleAutoCompleteTransaction } from "../../jobs/transaction.scheduler.js";
import { sendPushNotification } from "../../utils/sendPushNotification.js";

const getTransactionDetailByAdmin = async (transactionId) => {
  const txn = await transactionRepo.getTransactionDetailByAdmin(transactionId);
  if (!txn) throwError("Transaksi tidak ditemukan", 404);

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
    fundReleaseRequest: fr
      ? {
          requested: true,
          status: fr.status,
          evidenceUrl: fr.evidence_url,
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

const getAllTransactionsForAdmin = async (filters) => {
  return await transactionRepo.getAllTransactionsForAdmin(filters);
};

const updateFundReleaseRequest = async (transactionId, status, adminId) => {
  const txn =
    await fundReleaseRequestRepository.getFundReleaseRequestByTransaction(
      transactionId
    );
  if (!txn) throwError("Permintaan rilis dana tidak ditemukan", 404);
  if (txn.status !== "pending") {
    throwError("Permintaan rilis dana tidak dalam status 'pending'", 400);
  }

  await fundReleaseRequestRepository.updateFundReleaseRequestStatus(
    txn.id,
    status,
    adminId
  );

  // ⏰ Set buyer_confirm_deadline H+2 jika approved
  if (status === "approved") {
    const now = new Date();
    const buyerConfirmDeadline = new Date(now.getTime() + 10 * 60 * 1000);

    const res = await transactionRepo.updateTransactionBuyerConfirmDeadline(
      transactionId,
      buyerConfirmDeadline
    );

    if (!res) {
      throwError(
        "Gagal memperbarui transaksi dengan deadline konfirmasi pembeli",
        500
      );
    }

    await scheduleAutoCompleteTransaction(transactionId, buyerConfirmDeadline);

    // 🔔 Notifikasi ke buyer bahwa admin menyetujui pencairan dana
    const buyerPushToken = await pushTokenService.getPushTokenByUserId(
      txn.transaction.buyer_id
    );
    if (buyerPushToken) {
      sendPushNotification(buyerPushToken, {
        title: "Konfirmasi Penerimaan Barang",
        body: `Admin menyetujui pencairan dana untuk transaksi. Harap konfirmasi penerimaan sebelum deadline.`,
        data: {
          transactionId: transactionId,
          screen: "transaction/buyer",
        },
      });
    }
  }
};

export default {
  getTransactionDetailByAdmin,
  getAllTransactionsForAdmin,
  updateFundReleaseRequest,
};
