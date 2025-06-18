import transactionRepo from "../../repositories/transaction.repository.js";
import complaintRepo from "../../repositories/complaint.repository.js";
import digitalStorageService from "../../services/digital-storage.service.js";
import throwError from "../../utils/throwError.js";

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
      "Hanya transaksi dengan status 'shipped' yang dapat diajukan komplain",
      400
    );
  }

  const existingComplaint = await complaintRepo.findComplaintByTransaction(
    transactionId
  );

  const ACTIVE_STATUSES = [
    "waiting_seller_approval",
    "under_investigation",
    "return_requested",
    "return_in_transit",
    "awaiting_seller_confirmation",
  ];

  if (existingComplaint && ACTIVE_STATUSES.includes(existingComplaint.status)) {
    throwError("Komplain masih aktif untuk transaksi ini", 400);
  }

  if (type !== "lost" && (!files || files.length === 0)) {
    throwError("Bukti harus disertakan untuk tipe komplain ini", 400);
  }

  if (type === "lost" && files && files.length > 0) {
    throwError("Tidak perlu mengunggah bukti untuk komplain tipe 'lost'", 400);
  }

  if (type !== "lost" && files.length > 5) {
    throwError("Maksimal 5 file bukti yang dapat diunggah", 400);
  }

  const uploadedUrls = await Promise.all(
    files.map((file) =>
      digitalStorageService.uploadToSpaces(
        file.buffer,
        file.originalname,
        file.mimetype
      )
    )
  );

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

  const forbiddenStatus = ["completed", "approved", "rejected_by_admin"];
  if (forbiddenStatus.includes(complaint.status)) {
    throwError("Komplain tidak dapat dibatalkan pada status ini", 400);
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
    complaintId: c.id,
    transactionId: c.transaction_id,
    itemName: c.transaction.item_name,
    price: c.transaction.total_amount,
    sellerEmail: c.transaction.seller?.email || null,
    trackingNumber: c.transaction.shipment?.tracking_number || null,
    courier: c.transaction.shipment?.courier?.name || null,
    complaintType: c.type,
    complaintStatus: c.status,
  }));
};

const getComplaintDetail = async (complaintId, buyerId) => {
  const complaint = await complaintRepo.getComplaintDetail(complaintId);
  if (!complaint || complaint.buyer_id !== buyerId) {
    throwError("Komplain tidak ditemukan atau bukan milik Anda", 404);
  }

  const timeline = [];
  if (complaint.created_at)
    timeline.push({
      label: "Pengajuan komplain buyer",
      timestamp: complaint.created_at,
    });
  if (complaint.updated_at && complaint.updated_at !== complaint.created_at)
    timeline.push({
      label: "Persetujuan komplain seller",
      timestamp: complaint.updated_at,
    });

  return {
    id: complaint.id,
    status: complaint.status,
    status_label: generateStatusLabel(complaint.status),
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
      sellerEmail: complaint.transaction.seller.email,
      courier: {
        name: complaint.transaction.shipment?.courier?.name || null,
      },
      trackingNumber: complaint.transaction.shipment?.tracking_number || null,
    },
  };
};

const generateStatusLabel = (status) => {
  switch (status) {
    case "waiting_seller_approval":
      return "Menunggu Persetujuan Seller";
    case "return_requested":
      return "Menunggu Pengembalian Barang";
    case "under_investigation":
      return "Investigasi Pengiriman";
    case "approved":
      return "Komplain Disetujui";
    case "rejected_by_seller":
      return "Ditolak Seller";
    case "canceled_by_buyer":
      return "Komplain Dibatalkan";
    default:
      return status;
  }
};

export default {
  createComplaint,
  cancelComplaint,
  getComplaintListByBuyer,
  getComplaintDetail,
};
