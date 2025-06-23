import transactionRepo from "../../repositories/transaction.repository.js";
import complaintRepo from "../../repositories/complaint.repository.js";
import digitalStorageService from "../../services/digital-storage.service.js";
import throwError from "../../utils/throwError.js";

const ACTIVE_STATUSES = [
  "waiting_seller_approval",
  "under_investigation",
  "return_requested",
  "return_in_transit",
  "awaiting_seller_confirmation",
  "awaiting_admin_approval",
  "awaiting_admin_confirmation",
];

const createComplaint = async ({
  transactionId,
  buyerId,
  type,
  reason,
  files,
}) => {
  const transaction = await transactionRepo.findTransactionById(transactionId);
  if (!transaction || transaction.buyer_id !== buyerId) {
    throwError("Transaksi tidak ditemukan atau bukan milik Anda", 404);
  }

  if (transaction.status !== "shipped") {
    throwError(
      "Hanya transaksi dengan status 'shipped' yang dapat dikomplain",
      400
    );
  }

  const existingComplaint = await complaintRepo.findComplaintByTransaction(
    transactionId
  );
  if (existingComplaint && ACTIVE_STATUSES.includes(existingComplaint.status)) {
    throwError("Masih ada komplain aktif pada transaksi ini", 400);
  }

  let uploadedUrls = [];
  if (type !== "lost") {
    if (!files || files.length === 0) throwError("Bukti wajib diunggah", 400);
    if (files.length > 5) throwError("Maksimal 5 file bukti", 400);

    uploadedUrls = await Promise.all(
      files.map((file) =>
        digitalStorageService.uploadToSpaces(
          file.buffer,
          file.originalname,
          file.mimetype
        )
      )
    );
  }

  const initialStatus =
    type === "lost" ? "under_investigation" : "waiting_seller_approval";

  const complaint = await complaintRepo.createComplaint({
    transaction_id: transactionId,
    buyer_id: buyerId,
    type,
    status: initialStatus,
    buyer_reason: reason || null,
    buyer_evidence_urls: uploadedUrls,
  });

  await transactionRepo.updateStatusAndClearConfirmDeadline(
    transactionId,
    "complain"
  );

  return complaint;
};

const cancelComplaint = async ({ complaintId, buyerId }) => {
  const complaint = await complaintRepo.findComplaintById(complaintId);
  if (!complaint || complaint.buyer_id !== buyerId) {
    throwError("Komplain tidak ditemukan atau bukan milik Anda", 404);
  }

  const forbiddenStatuses = [
    "completed",
    "approved_by_admin",
    "rejected_by_admin",
  ];
  if (forbiddenStatuses.includes(complaint.status)) {
    throwError("Komplain tidak bisa dibatalkan pada status ini", 400);
  }

  await transactionRepo.updateStatus(complaint.transaction_id, "shipped");

  return await complaintRepo.updateComplaintStatus(
    complaintId,
    "canceled_by_buyer"
  );
};

const getComplaintListByBuyer = async (buyerId) => {
  const complaints = await complaintRepo.getComplaintsByBuyer(buyerId);
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
      sellerEmail: c.transaction.seller?.email || null,
      shipment: {
        trackingNumber: c.transaction.shipment?.tracking_number || null,
        courier: c.transaction.shipment?.courier?.name || null,
      },
    },
  }));
};

const getComplaintDetailByBuyer = async (complaintId, buyerId) => {
  const complaint = await complaintRepo.getComplaintDetail(complaintId);
  if (!complaint || complaint.buyer_id !== buyerId) {
    throwError("Komplain tidak ditemukan atau bukan milik Anda", 404);
  }

  const timeline = [
    { label: "Pengajuan Komplain", timestamp: complaint.created_at },
  ];

  if (complaint.seller_responded_at) {
    timeline.push({
      label: "Respon Seller",
      timestamp: complaint.seller_responded_at,
    });
  }

  if (complaint.admin_responded_at) {
    timeline.push({
      label: "Respon Admin",
      timestamp: complaint.admin_responded_at,
    });
  }

  if (complaint.resolved_at) {
    timeline.push({
      label: "Komplain Selesai",
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
    buyer_requested_confirmation_at: complaint.buyer_requested_confirmation_at,
    buyer_requested_confirmation_reason:
      complaint.buyer_requested_confirmation_reason,
    buyer_requested_confirmation_evidence_urls:
      complaint.buyer_requested_confirmation_evidence_urls,
    seller_confirm_deadline: complaint.seller_confirm_deadline,
    resolved_at: complaint.resolved_at,
    created_at: complaint.created_at,
    updated_at: complaint.updated_at,
    timeline,
    transaction: {
      transactionCode: complaint.transaction.transaction_code,
      itemName: complaint.transaction.item_name,
      totalAmount: complaint.transaction.total_amount,
      virtualAccount: complaint.transaction.virtual_account_number,
      sellerEmail: complaint.transaction.seller?.email || null,
      courier: {
        name: complaint.transaction.shipment?.courier?.name || null,
      },
      trackingNumber: complaint.transaction.shipment?.tracking_number || null,
    },
  };
};

export default {
  createComplaint,
  cancelComplaint,
  getComplaintListByBuyer,
  getComplaintDetailByBuyer,
};
