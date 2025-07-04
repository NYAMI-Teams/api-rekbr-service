import throwError from "../../utils/throwError.js";
import complaintRepo from "../../repositories/complaint.repository.js";
import transactionRepo from "../../repositories/transaction.repository.js";
import { scheduleAutoCompleteConfirmation } from "../../jobs/complaint.scheduler.js";
import prisma from "../../prisma/client.js";
import pushTokenService from "../pushToken.service.js";
import { sendPushNotification } from "../../utils/sendPushNotification.js";
import { scheduleAutoCancelShipment } from "../../jobs/transaction.scheduler.js";

const getAllComplaintList = async (type, status) => {
  const filters = {};
  if (type) filters.type = type;
  if (status) filters.status = status;
  const complaints = await complaintRepo.getAllComplaintList(filters);
  return complaints;
};

const getComplaintById = async (id) => {
  const complaint = await complaintRepo.getComplaintById(id);
  if (!complaint) {
    throwError("Pengaduan tidak ditemukan", 404);
  }
  return complaint;
};

const responseComplaint = async (id, action, adminId) => {
  const complaint = await complaintRepo.getComplaintById(id);

  console.log("ini complain", complaint);

  if (!complaint) {
    throwError("Pengaduan tidak ditemukan", 404);
  }

  // 1. Komplain LOST - response admin

  if (complaint.status === "under_investigation") {
    if (!complaint.transaction) {
      throwError("Transaksi untuk pengaduan ini tidak ditemukan", 404);
    }

    const status = action === "approve" ? "completed" : "rejected_by_admin";

    // run in Prisma transaction
    return await prisma.$transaction(async (tx) => {
      if (action === "approve") {
        await complaintRepo.complaintTransactionUpdate(
          id,
          complaint.transaction.item_price,
          tx
        );
      } else {
        await transactionRepo.updateStatusToShipped(
          complaint.transaction.id,
          tx
        );
      }

      const buyerPushToken = await pushTokenService.getPushTokenByUserId(
        complaint.buyer_id
      );
      if (buyerPushToken) {
        sendPushNotification(buyerPushToken, {
          title:
            action === "approve" ? "Komplain Disetujui" : "Komplain Ditolak",
          body:
            action === "approve"
              ? `Admin menyetujui komplain barang hilang. Dana akan dikembalikan.`
              : `Admin menolak komplain barang hilang. Transaksi dilanjutkan.`,
          data: {
            screen: "complaint/buyer",
          },
        });
      }

      return await complaintRepo.updateComplaint(
        id,
        {
          status,
          admin_responded_at: new Date(),
          resolved_at: new Date(),
          admin_decision: action === "approve" ? "approved" : "rejected",
        },
        tx
      );
    });
  }

  // 2. Komplain DAMAGED - seller sudah respond
  if (complaint.status === "awaiting_admin_approval") {
    const status =
      action === "approve" ? "return_requested" : "rejected_by_admin";

    return await prisma.$transaction(async (tx) => {
      const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // buyer input shipment deadline 1 hari dari sekarang

      if (action === "reject") {
        await transactionRepo.updateStatusToShipped(
          complaint.transaction.id,
          tx
        );
      }

      if (action === "approve") {
        // await scheduleAutoCancelShipment();
      }

      const buyerPushToken = await pushTokenService.getPushTokenByUserId(
        complaint.buyer_id
      );
      if (buyerPushToken) {
        sendPushNotification(buyerPushToken, {
          title:
            action === "approve" ? "Komplain Disetujui" : "Komplain Ditolak",
          body:
            action === "approve"
              ? `Admin menyetujui komplain barang rusak. Silakan kirim barang retur.`
              : `Admin menolak komplain. Dana tetap diteruskan ke seller.`,
          data: {
            screen: "complaint/buyer",
          },
        });
      }

      return await complaintRepo.updateComplaint(
        id,
        {
          status,
          admin_responded_at: new Date(),
          admin_decision: action === "approve" ? "approved" : "rejected",
          buyer_deadline_input_shipment:
            action === "approve" ? deadline : undefined,
        },
        tx
      );
    });
  }

  // 3. Buyer minta konfirmasi (setelah retur)
  if (complaint.status === "awaiting_admin_confirmation") {
    const status =
      action === "approve"
        ? "awaiting_seller_confirmation"
        : "return_in_transit";

    let deadline = null;

    return await prisma.$transaction(async (tx) => {
      if (action === "approve") {
        deadline = new Date(Date.now() + 2 * 60 * 1000); // waktu untuk seller konfirmasi barang sudah sampai 2 hari dari sekarang
        await scheduleAutoCompleteConfirmation(id, deadline.getTime());
      }

      if (action === "approve") {
        const sellerPushToken = await pushTokenService.getPushTokenByUserId(
          complaint.transaction.seller_id
        );
        if (sellerPushToken) {
          sendPushNotification(sellerPushToken, {
            title: "Permintaan Konfirmasi Retur",
            body: `Admin menyetujui permintaan buyer. Mohon konfirmasi barang retur.`,
            data: {
              screen: "complaint/seller",
            },
          });
        }
      } else {
        const buyerPushToken = await pushTokenService.getPushTokenByUserId(
          complaint.buyer_id
        );
        if (buyerPushToken) {
          sendPushNotification(buyerPushToken, {
            title: "Permintaan Konfirmasi Ditolak",
            body: `Admin menolak permintaan konfirmasi retur untuk komplain ${complaint.id}.`,
            data: {
              screen: "complaint/buyer",
            },
          });
        }
      }

      return await complaintRepo.updateComplaint(
        id,
        {
          status,
          request_confirmation_status:
            action === "approve" ? "approved" : "rejected",
          request_confirmation_admin_id: adminId,
          admin_approved_confirmation_at:
            action === "approve" ? new Date() : undefined,
          admin_rejected_confirmation_at:
            action === "reject" ? new Date() : undefined,
          seller_confirm_deadline: action === "approve" ? deadline : undefined,
        },
        tx
      );
    });
  }

  throwError("Pengaduan tidak dalam status yang dapat direspon", 400);
};

export default {
  getAllComplaintList,
  getComplaintById,
  responseComplaint,
};
