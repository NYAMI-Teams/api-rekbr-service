import throwError from "../../utils/throwError.js";
import complaintRepo from "../../repositories/complaint.repository.js";
import transactionRepo from "../../repositories/transaction.repository.js";
import digitalStorageService from "../digital-storage.service.js";
import prisma from "../../prisma/client.js";
import { scheduleAutoCancelComplaint } from "../../jobs/complaint.scheduler.js";
import { removeJobIfExists } from "../../utils/bullmq/removeJobIfExists.js";
import { complaintQueue } from "../../queues/complaint.queue.js";

const patchSellerResponse = async ({
  status,
  photo,
  seller_response_reason,
  complaintId,
}) => {
  const existingComplaint = await complaintRepo.findComplaintById(complaintId);

  if (!existingComplaint) {
    throwError("Komplain tidak ditemukan", 404);
  }

  if (existingComplaint.status !== "waiting_seller_approval") {
    throwError(
      "Komplain tidak dalam status yang dapat direspon oleh seller",
      400
    );
  }

  if (!seller_response_reason) {
    throwError("Alasan respons penjual tidak boleh kosong", 400);
  }

  let photoUrl = [];
  if (photo && photo.length > 0) {
    photoUrl = await Promise.all(
      photo.map((photo) =>
        digitalStorageService.uploadToSpaces(
          photo.buffer,
          photo.originalname,
          photo.mimetype
        )
      )
    );
  }

  const sellerDecision =
    status === "return_requested" ? "approved" : "rejected";

  // ⏱️ Set deadline jika seller menyetujui retur
  let deadline = null;
  if (sellerDecision === "approved") {
    deadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    // new Date(Date.now() + 2 * 60 * 1000); // 2 menit dari sekarang
  }

  const updatedComplaint = await complaintRepo.sellerResponseUpdate(
    complaintId,
    sellerDecision,
    photoUrl,
    seller_response_reason,
    deadline
  );

  // ⏳ Schedule job cancel jika buyer tidak kirim resi
  if (sellerDecision === "approved") {
    const delay = deadline.getTime() - Date.now();
    await scheduleAutoCancelComplaint(complaintId, delay);
  }

  return updatedComplaint;
};

const patchSellerItemReceive = async (complaintId, status, sellerId) => {
  const existingComplaint = await complaintRepo.getComplaintDetail(complaintId);

  if (
    !existingComplaint ||
    existingComplaint.transaction.seller_id !== sellerId
  ) {
    throwError("Komplain tidak ditemukan atau bukan milik Anda", 404);
  }

  // Check if complaint already completed or rejected
  if (
    ["completed", "rejected_by_admin", "canceled_by_buyer"].includes(
      existingComplaint.status
    )
  ) {
    throwError("Komplain sudah selesai atau tidak dapat diproses", 400);
  }

  // Safe check for confirmation_status
  const confirmationStatus = existingComplaint.request_confirmation_status
    ? existingComplaint.request_confirmation_status.toLowerCase()
    : "";

  if (
    confirmationStatus !== "approved" ||
    existingComplaint.status !== "awaiting_seller_confirmation"
  ) {
    throwError("Komplain belum disetujui admin atau status tidak sesuai", 400);
  }

  if (status.toLowerCase() !== "completed") {
    throwError("Status tidak sesuai", 400);
  }

  const transactionId = existingComplaint.transaction_id;

  const txnDetail = await transactionRepo.getTransactionDetailBySeller(
    transactionId,
    sellerId
  );

  const refundAmount =
    Number(txnDetail.total_amount) -
    Number(txnDetail.platform_fee || 0) -
    Number(txnDetail.insurance_fee || 0);

  const result = await prisma.$transaction(async (tx) => {
    const updatedComplaint = await complaintRepo.sellerItemReceiveUpdate(
      complaintId,
      status,
      tx
    );

    const updatedTransaction = await complaintRepo.complaintTransactionUpdate(
      complaintId,
      refundAmount,
      tx
    );

    const updatedReceivedAt = await complaintRepo.complaintShipmentReceived(
      complaintId,
      tx
    );

    return {
      updatedComplaint,
      updatedTransaction,
      updatedReceivedAt,
    };
  });

  // Clear any remaining queue job
  await removeJobIfExists(
    complaintQueue,
    `confirm-return-deadline:${complaintId}`
  );

  return { result };
};

const getComplaintListBySeller = async (sellerId, offset, limit) => {
  const complaints = await complaintRepo.getComplaintsBySeller(
    sellerId,
    offset,
    limit
  );
  return complaints.map((c) => ({
    id: c.id,
    type: c.type,
    status: c.status,
    createdAt: c.created_at,
    seller_response_deadline: complaints.seller_response_deadline,
    buyerDeadlineInputShipment: c.buyer_deadline_input_shipment,
    sellerConfirmDeadline: c.seller_confirm_deadline,
    sellerResponseDeadline: c.seller_response_deadline,
    returnShipment: c.return_shipment
      ? {
          trackingNumber: c.return_shipment.tracking_number,
          courierName: c.return_shipment.courier?.name || null,
        }
      : null,
    transaction: {
      id: c.transaction.id,
      transactionCode: c.transaction.transaction_code,
      itemName: c.transaction.item_name,
      totalAmount: c.transaction.total_amount,
      status: c.transaction.status,
      buyerEmail: c.transaction.buyer?.email || null,
      shipment: {
        trackingNumber: c.transaction.shipment?.tracking_number || null,
        courier: c.transaction.shipment?.courier?.name || null,
      },
    },
  }));
};

const getComplaintDetailBySeller = async (complaintId, sellerId) => {
  const complaint = await complaintRepo.getComplaintDetail(complaintId);
  if (!complaint || complaint.transaction.seller_id !== sellerId) {
    throwError("Komplain tidak ditemukan atau bukan milik Anda", 404);
  }

  let timeline = [];

  if (complaint.type === "lost") {
    // Timeline untuk komplain LOST
    if (complaint.created_at) {
      timeline.push({
        label: "Investigasi pada barang buyer",
        timestamp: complaint.created_at,
      });
    }
    if (complaint.admin_responded_at) {
      let message = "";
      if (complaint.admin_decision === "approved") {
        message = "Admin menyetujui komplain. Dana akan direfund ke buyer.";
      } else if (complaint.admin_decision === "rejected") {
        message =
          "Admin menolak klaim barang hilang karena pengiriman sudah terkonfirmasi sukses oleh kurir.";
      } else {
        message = "Admin telah merespon komplain.";
      }
      timeline.push({
        label: complaint.admin_decision
          ? complaint.admin_decision === "approved"
            ? "Admin menyetujui komplain. Dana akan direfund ke buyer."
            : "Admin menolak atas komplain buyer"
          : "Respon Admin",
        message,
        timestamp: complaint.admin_responded_at,
        decision: complaint.admin_decision || null,
      });
    }
    if (
      complaint.status === "completed" ||
      complaint.status === "approved_by_admin" ||
      complaint.status === "rejected_by_admin"
    ) {
      timeline.push({
        label: "Komplain Selesai",
        message: "Proses komplain telah selesai.",
      });
    }
  } else if (complaint.type === "damaged") {
    // Timeline untuk komplain DAMAGED
    if (complaint.created_at) {
      timeline.push({
        label: "Pengajuan Komplain Buyer",
        message:
          "Buyer mengajukan komplain barang bermasalah. Tunggu persetujuan seller/admin.",
        reason: complaint.buyer_reason || null,
        evidence: complaint.buyer_evidence_urls || null,
        timestamp: complaint.created_at,
      });
    }
    if (
      complaint.seller_response_deadline &&
      new Date() > new Date(complaint.seller_response_deadline)
    ) {
      timeline.push({
        label: "Seller tidak merespon",
        message: "Proses dilanjutkan ke admin",
        timestamp: complaint.seller_response_deadline,
      });
    }
    if (complaint.seller_responded_at) {
      let message = "";
      if (complaint.seller_decision === "approved") {
        message =
          "Seller menyetujui pengembalian barang. Buyer akan mengirimkan barang retur.";
      } else if (complaint.seller_decision === "rejected") {
        message = "Seller menolak komplain. Alasan dan bukti sudah diberikan.";
      } else {
        message = "Seller telah merespon komplain.";
      }
      timeline.push({
        label: complaint.seller_decision
          ? complaint.seller_decision === "approved"
            ? "Persetujuan komplain seller"
            : "Penolakan komplain seller"
          : "Respon Seller",
        message,
        reason: complaint.seller_response_reason || null,
        evidence: complaint.seller_evidence_urls || null,
        timestamp: complaint.seller_responded_at,
        decision: complaint.seller_decision || null,
      });
    }
    if (complaint.admin_responded_at) {
      let message = "";
      if (complaint.admin_decision === "approved") {
        message =
          "Admin menyetujui komplain. Refund akan diproses ke buyer sesuai ketentuan.";
      } else if (complaint.admin_decision === "rejected") {
        message = "Admin menolak komplain. Dana tetap diteruskan ke seller.";
      } else {
        message = "Admin telah merespon komplain.";
      }
      timeline.push({
        label:
          complaint.admin_decision === "approved"
            ? "Admin setuju dan dana sudah dikembalikan"
            : "Admin menolak atas komplain buyer",
        message,
        timestamp: complaint.admin_responded_at,
        decision: complaint.admin_decision || null,
      });
    }
    // Timeline pengembalian barang oleh buyer (input resi)
    if (
      complaint.return_shipment &&
      complaint.return_shipment.tracking_number &&
      complaint.return_shipment.courier_id
    ) {
      timeline.push({
        label: "Pengembalian Barang oleh Buyer",
        message: "Buyer telah menginput resi pengembalian barang.",
        trackingNumber: complaint.return_shipment.tracking_number,
        courier: complaint.return_shipment.courier.name,
        timestamp: complaint.return_shipment.shipment_date,
      });
    }
    if (complaint.request_confirmation_status === "pending") {
      timeline.push({
        label: "Permintaan Konfirmasi Buyer",
        message:
          "Buyer meminta admin untuk konfirmasi barang retur sudah sampai di seller.",
        reason: complaint.buyer_requested_confirmation_reason || null,
        evidence: complaint.buyer_requested_confirmation_evidence_urls || null,
        timestamp: complaint.buyer_requested_confirmation_at,
      });
    }
    if (complaint.request_confirmation_status === "approved") {
      let maxSellerConfirmDeadline = null;
      if (complaint.seller_confirm_deadline) {
        maxSellerConfirmDeadline = new Date(
          complaint.seller_confirm_deadline
        ).toISOString();
      }
      timeline.push({
        label: "Permintaan Konfirmasi Buyer",
        message:
          "Admin menyetujui permintaan konfirmasi buyer. Seller harus konfirmasi penerimaan barang retur.",
        timestamp: complaint.admin_approved_confirmation_at,
        maxSellerConfirmDeadline,
      });
    }
    if (complaint.request_confirmation_status === "rejected") {
      timeline.push({
        label: "Permintaan Konfirmasi Buyer",
        message: "Admin menolak permintaan konfirmasi buyer",
        timestamp: complaint.admin_rejected_confirmation_at,
      });
    }
    // seller confirmation at
    if (complaint.seller_confirmed_return_at) {
      timeline.push({
        label: "Konfirmasi seller dan dana berhasil dikembalikan",
        message:
          "Seller mengkonfirmasi barang retur telah diterima. Dana akan direfund ke buyer.",
        timestamp: complaint.seller_confirmed_return_at,
      });
    }
    if (
      complaint.status === "completed" ||
      complaint.status === "approved_by_admin" ||
      complaint.status === "rejected_by_admin"
    ) {
      timeline.push({
        label: "Komplain Selesai",
        message: "Proses komplain telah selesai.",
        timestamp: complaint.resolved_at,
      });
    }
  } else {
    // Default timeline untuk type lain
    if (complaint.created_at)
      timeline.push({
        label: "Pengajuan Komplain Buyer",
        message: "Buyer mengajukan komplain.",
        reason: complaint.buyer_reason || null,
        evidence: complaint.buyer_evidence_urls || null,
        timestamp: complaint.created_at,
      });
    if (complaint.seller_responded_at) {
      let message = "";
      if (complaint.seller_decision === "approved") {
        message = "Seller menyetujui komplain.";
      } else if (complaint.seller_decision === "rejected") {
        message = "Seller menolak komplain.";
      } else {
        message = "Seller telah merespon komplain.";
      }
      timeline.push({
        label: `Respon Seller${
          complaint.seller_decision
            ? ` (${
                complaint.seller_decision === "approved"
                  ? "Disetujui"
                  : "Ditolak"
              })`
            : ""
        }`,
        message,
        reason: complaint.seller_response_reason || null,
        evidence: complaint.seller_evidence_urls || null,
        timestamp: complaint.seller_responded_at,
        decision: complaint.seller_decision || null,
      });
    }
    if (complaint.admin_responded_at) {
      let message = "";
      if (complaint.admin_decision === "approved") {
        message = "Admin menyetujui komplain.";
      } else if (complaint.admin_decision === "rejected") {
        message = "Admin menolak komplain.";
      } else {
        message = "Admin telah merespon komplain.";
      }
      timeline.push({
        label: `Respon Admin${
          complaint.admin_decision
            ? ` (${
                complaint.admin_decision === "approved"
                  ? "Disetujui"
                  : "Ditolak"
              })`
            : ""
        }`,
        message,
        timestamp: complaint.admin_responded_at,
        decision: complaint.admin_decision || null,
      });
    }
    if (complaint.resolved_at)
      timeline.push({
        label: "Komplain Selesai",
        message: "Proses komplain telah selesai.",
        timestamp: complaint.resolved_at,
      });
  }

  return {
    id: complaint.id,
    status: complaint.status,
    type: complaint.type,
    buyer_reason: complaint.buyer_reason,
    buyer_evidence_urls: complaint.buyer_evidence_urls,
    seller_response_deadline: complaint.seller_response_deadline,
    seller_response_reason: complaint.seller_response_reason,
    seller_evidence_urls: complaint.seller_evidence_urls,
    seller_decision: complaint.seller_decision,
    admin_decision: complaint.admin_decision,
    buyer_deadline_input_shipment: complaint.buyer_deadline_input_shipment,
    canceled_by_buyer_at: complaint.canceled_by_buyer_at,
    created_at: complaint.created_at,
    updated_at: complaint.updated_at,
    timeline,
    transaction: {
      transactionCode: complaint.transaction.transaction_code,
      itemName: complaint.transaction.item_name,
      totalAmount: complaint.transaction.total_amount,
      virtualAccount: complaint.transaction.virtual_account_number,
      status: complaint.transaction.status,
      buyerEmail: complaint.transaction.buyer?.email || null,
      courier: {
        name: complaint.transaction.shipment?.courier?.name || null,
      },
      trackingNumber: complaint.transaction.shipment?.tracking_number || null,
    },
  };
};

export default {
  patchSellerResponse,
  patchSellerItemReceive,
  getComplaintListBySeller,
  getComplaintDetailBySeller,
};
