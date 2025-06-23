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

  const timeline = [];
  if (complaint.created_at)
    timeline.push({
      label: "Pengajuan Komplain Buyer",
      timestamp: complaint.created_at,
    });
  if (complaint.seller_responded_at)
    timeline.push({
      label: "Respon Seller",
      timestamp: complaint.seller_responded_at,
    });
  if (complaint.admin_responded_at)
    timeline.push({
      label: "Respon Admin",
      timestamp: complaint.admin_responded_at,
    });
  if (complaint.resolved_at)
    timeline.push({
      label: "Komplain Selesai",
      timestamp: complaint.resolved_at,
    });

  return {
    id: complaint.id,
    status: complaint.status,
    type: complaint.type,
    buyer_reason: complaint.buyer_reason,
    buyer_evidence_urls: complaint.buyer_evidence_urls,
    seller_response_reason: complaint.seller_response_reason,
    seller_evidence_urls: complaint.seller_evidence_urls,
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
