import throwError from "../../utils/throwError.js";
import complaintRepo from "../../repositories/complaint.repository.js";
import transactionRepo from "../../repositories/transaction.repository.js";
import digitalStorageService from "../digital-storage.service.js";
import prisma from "../../prisma/client.js";

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

  const updatedComplaint = await complaintRepo.sellerResponseUpdate(
    complaintId,
    sellerDecision,
    photoUrl,
    seller_response_reason
  );

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

  if (
    ["completed", "rejected_by_admin", "canceled_by_buyer"].includes(
      existingComplaint.status
    )
  ) {
    throwError("Komplain sudah selesai atau tidak dapat diproses", 400);
  }

  if (
    existingComplaint.request_confirmation_status?.toLowerCase() !==
      "approved" ||
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

  return { result };
};

const getComplaintListBySeller = async (sellerId) => {
  const complaints = await complaintRepo.getComplaintsBySeller(sellerId);
  return complaints.map((c) => ({
    id: c.id,
    type: c.type,
    status: c.status,
    createdAt: c.created_at,
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
        label: "Pengajuan Komplain Buyer (LOST)",
        message: "Buyer mengajukan komplain barang hilang.",
        timestamp: complaint.created_at,
      });
    }
    if (complaint.admin_responded_at) {
      let message = "";
      if (complaint.admin_decision === "approved") {
        message = "Admin menyetujui komplain. Dana akan direfund ke buyer.";
      } else if (complaint.admin_decision === "rejected") {
        message = "Admin menolak komplain. Barang dinyatakan tidak hilang.";
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
    if (complaint.resolved_at) {
      timeline.push({
        label: "Komplain Selesai",
        message: "Proses komplain telah selesai.",
        timestamp: complaint.resolved_at,
      });
    }
  } else if (complaint.type === "damaged") {
    // Timeline untuk komplain DAMAGED
    if (complaint.created_at) {
      timeline.push({
        label: "Pengajuan Komplain Buyer (DAMAGED)",
        message: "Buyer mengajukan komplain barang rusak.",
        timestamp: complaint.created_at,
      });
    }
    if (complaint.seller_responded_at) {
      let message = "";
      if (complaint.seller_decision === "approved") {
        message =
          "Seller mau nerima barang kembaliin agar dapat ditukar, kirim bukti Refund";
      } else if (complaint.seller_decision === "rejected") {
        message =
          "Penolakan dikarenakan bukti buyer belum cukup kuat dan tidak ada alasan menerima hal seperti itu";
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
        timestamp: complaint.seller_responded_at,
        decision: complaint.seller_decision || null,
      });
    }
    if (complaint.admin_responded_at) {
      let message = "";
      if (complaint.admin_decision === "approved") {
        message =
          "Setelah tinjau bukti yang kamu kirim, komplain dinyatakan valid. Refund akan diproses meski seller menolak, sesuai ketentuan yang berlaku.";
      } else if (complaint.admin_decision === "rejected") {
        message =
          "Setelah bukti ditinjau, pengajuan tidak memenuhi syarat. Komplain dinyatakan tidak valid dan dana tetap diteruskan ke seller.";
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
    if (complaint.buyer_requested_confirmation_at) {
      timeline.push({
        label: "Permintaan Konfirmasi Buyer ke Admin",
        message:
          "Buyer meminta admin untuk konfirmasi penerimaan barang retur.",
        timestamp: complaint.buyer_requested_confirmation_at,
      });
    }
    if (complaint.seller_confirmed_return_at) {
      timeline.push({
        label: "Konfirmasi Seller Barang Retur Diterima",
        message: "Seller mengkonfirmasi barang retur telah diterima.",
        timestamp: complaint.seller_confirmed_return_at,
      });
    }
    if (complaint.resolved_at) {
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
    seller_response_reason: complaint.seller_response_reason,
    seller_evidence_urls: complaint.seller_evidence_urls,
    seller_decision: complaint.seller_decision,
    admin_decision: complaint.admin_decision,
    created_at: complaint.created_at,
    updated_at: complaint.updated_at,
    timeline,
    transaction: {
      transactionCode: complaint.transaction.transaction_code,
      itemName: complaint.transaction.item_name,
      totalAmount: complaint.transaction.total_amount,
      virtualAccount: complaint.transaction.virtual_account_number,
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
