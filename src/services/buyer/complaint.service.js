import transactionRepo from "../../repositories/transaction.repository.js";
import complaintRepo from "../../repositories/complaint.repository.js";
import digitalStorageService from "../../services/digital-storage.service.js";
import throwError from "../../utils/throwError.js";
import { complaintQueue } from "../../queues/complaint.queue.js";
import { removeJobIfExists } from "../../utils/bullmq/removeJobIfExists.js";

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

const getComplaintListByBuyer = async (buyerId, offset, limit) => {
  const complaints = await complaintRepo.getComplaintsByBuyer(
    buyerId,
    offset,
    limit
  );
  return complaints.map((c) => ({
    id: c.id,
    type: c.type,
    status: c.status,
    createdAt: c.created_at,
    seller_response_deadline: complaint.seller_response_deadline,
    buyerDeadlineInputShipment: c.buyer_deadline_input_shipment,
    sellerConfirmDeadline: c.seller_confirm_deadline,
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

  let timeline = [];

  if (complaint.type === "lost") {
    // Timeline untuk komplain LOST
    if (complaint.created_at) {
      timeline.push({
        label: "Investigasi pada barang kamu",
        timestamp: complaint.created_at,
      });
    }
    if (complaint.admin_responded_at) {
      let message = "";
      if (complaint.admin_decision === "approved") {
        message = "Admin menyetujui komplain. Dana akan direfund ke buyer.";
      } else if (complaint.admin_decision === "rejected") {
        message =
          "Sayangnya, kami tidak bisa memproses klaim barang hilang karena pengiriman sudah terkonfirmasi sukses oleh kurir.";
      } else {
        message = "Admin telah merespon komplain.";
      }
      timeline.push({
        label: complaint.admin_decision
          ? complaint.admin_decision === "approved"
            ? "Admin menyetujui komplain. Dana akan direfund ke buyer."
            : "Admin menolak atas komplain kamu"
          : "Respon Admin",
        message,
        timestamp: complaint.admin_responded_at,
        decision: complaint.admin_decision || null,
      });
    }
  } else if (complaint.type === "damaged") {
    // Timeline untuk komplain DAMAGED
    if (complaint.created_at) {
      timeline.push({
        label: "Pengajuan Komplain Buyer",
        message:
          "Buyer mau ngembaliin barang yang bermasalah. Dana rekber bakal dikembalikan setelah komplain disetujui, ya!",
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
          "Seller mau nerima barang kembaliin agar dapat ditukar, kirim bukti Refund";
      } else if (complaint.seller_decision === "rejected") {
        message =
          "Penolakan dikarenakan bukti buyer belum cukup kuat dan tidak ada alasan menerima hal seperti itu";
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
          "Setelah tinjau bukti yang kamu kirim, komplain dinyatakan valid. Refund akan diproses meski seller menolak, sesuai ketentuan yang berlaku.";
      } else if (complaint.admin_decision === "rejected") {
        message =
          "Setelah bukti ditinjau, pengajuan tidak memenuhi syarat. Komplain dinyatakan tidak valid dan dana tetap diteruskan ke seller.";
      } else {
        message = "Admin telah merespon komplain.";
      }
      timeline.push({
        label:
          complaint.admin_decision === "approved"
            ? "Admin setuju dan dana sudah dikembalikan"
            : "Admin menolak atas komplain kamu",
        message,
        timestamp: complaint.admin_responded_at,
        decision: complaint.admin_decision || null,
      });
    }

    // Timeline pengembalian barang oleh buyer (input resi)
    if (
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
        message: "Melalui resi harusnya barang sudah sampai di seller",
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
        message: "Admin menyetujui permintaan konfirmasi buyer",
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
        message: "Seller mengkonfirmasi barang retur telah diterima.",
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
    seller_responded_at: complaint.seller_responded_at,
    admin_decision: complaint.admin_decision,
    admin_responded_at: complaint.admin_responded_at,
    buyer_deadline_input_shipment: complaint.buyer_deadline_input_shipment,
    seller_confirm_deadline: complaint.seller_confirm_deadline,
    request_confirmation_status: complaint.request_confirmation_status,
    admin_approved_confirmation_at: complaint.admin_approved_confirmation_at,
    admin_rejected_confirmation_at: complaint.admin_rejected_confirmation_at,
    seller_confirmed_return_at: complaint.seller_confirmed_return_at,
    buyer_requested_confirmation_at: complaint.buyer_requested_confirmation_at,
    buyer_requested_confirmation_reason:
      complaint.buyer_requested_confirmation_reason,
    buyer_requested_confirmation_evidence_urls:
      complaint.buyer_requested_confirmation_evidence_urls,
    resolved_at: complaint.resolved_at,
    created_at: complaint.created_at,
    updated_at: complaint.updated_at,
    canceled_by_buyer_at: complaint.canceled_by_buyer_at,
    timeline,
    transaction: {
      transactionCode: complaint.transaction.transaction_code,
      itemName: complaint.transaction.item_name,
      totalAmount: complaint.transaction.total_amount,
      itemPrice: complaint.transaction.item_price,
      platformFee: complaint.transaction.platform_fee,
      insuranceFee: complaint.transaction.insurance_fee,
      virtualAccount: complaint.transaction.virtual_account_number,
      status: complaint.transaction.status,
      sellerEmail: complaint.transaction.seller?.email || null,
      shipment: {
        trackingNumber: complaint.transaction.shipment?.tracking_number || null,
        courier: complaint.transaction.shipment?.courier?.name || null,
      },
    },
    returnShipment: complaint.return_shipment
      ? {
          trackingNumber: complaint.return_shipment.tracking_number,
          courierName: complaint.return_shipment.courier?.name || null,
          shipmentDate: complaint.return_shipment.shipment_date,
          photoUrl: complaint.return_shipment.photo_url || null,
        }
      : null,
  };
};

const submitReturnShipment = async ({
  complaintId,
  buyerId,
  courierId,
  trackingNumber,
  photo,
}) => {
  const complaint = await complaintRepo.getComplaintDetail(complaintId);
  if (!complaint || complaint.buyer_id !== buyerId) {
    throwError("Komplain tidak ditemukan atau bukan milik Anda", 404);
  }

  if (complaint.status !== "return_requested") {
    throwError("Komplain tidak dalam status pengembalian", 400);
  }

  let photoUrl = null;
  if (photo) {
    photoUrl = await digitalStorageService.uploadToSpaces(
      photo.buffer,
      photo.originalname,
      photo.mimetype
    );
  }

  const returnShipment = await complaintRepo.updateReturnShipment(complaintId, {
    courier_id: courierId,
    tracking_number: trackingNumber,
    shipment_date: new Date(),
    photo_url: photoUrl,
  });

  await complaintRepo.updateComplaintStatus(complaintId, "return_in_transit");
  await removeJobIfExists(
    complaintQueue,
    `cancel-return-shipment:${complaintId}`
  );

  return returnShipment;
};

const requestBuyerConfirmation = async ({
  complaintId,
  buyerId,
  reason,
  file,
}) => {
  const complaint = await complaintRepo.getComplaintDetail(complaintId);

  if (!complaint || complaint.buyer_id !== buyerId) {
    throwError("Komplain tidak ditemukan atau bukan milik Anda", 404);
  }

  if (complaint.status !== "return_in_transit") {
    throwError("Komplain belum dalam proses pengembalian", 400);
  }

  let uploadedUrl = null;
  if (file) {
    uploadedUrl = await digitalStorageService.uploadToSpaces(
      file.buffer,
      file.originalname,
      file.mimetype
    );
  }

  return await complaintRepo.updateComplaintWithBuyerConfirmRequest(
    complaintId,
    reason,
    uploadedUrl
  );
};

export default {
  createComplaint,
  cancelComplaint,
  getComplaintListByBuyer,
  getComplaintDetailByBuyer,
  submitReturnShipment,
  requestBuyerConfirmation,
};
