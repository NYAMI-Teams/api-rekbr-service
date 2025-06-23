import throwError from "../../utils/throwError.js";
import complaintRepo from "../../repositories/complaint.repository.js";
import transactionRepo from "../../repositories/transaction.repository.js";

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
  if (!complaint) {
    throwError("Pengaduan tidak ditemukan", 404);
  }

  // 1. Komplain LOST (langsung ke admin)
  if (complaint.status === "under_investigation") {
    const status =
      action === "approve" ? "approved_by_admin" : "rejected_by_admin";

    if (action === "approve") {
      await complaintRepo.complaintTransactionUpdate(
        id,
        complaint.transaction.item_price
      );
    } else {
      await transactionRepo.updateStatusToShipped(complaint.transaction.id);
    }

    return await complaintRepo.updateComplaint(id, {
      status,
      admin_responded_at: new Date(),
      resolved_at: new Date(),
      admin_decision: action === "approve" ? "approved" : "rejected",
    });
  }

  // 2. Komplain DAMAGED - seller sudah respond
  if (complaint.status === "awaiting_admin_approval") {
    const status =
      action === "approve" ? "return_requested" : "rejected_by_admin";

    if (action === "reject") {
      await transactionRepo.updateStatusToShipped(complaint.transaction.id);
    }

    return await complaintRepo.updateComplaint(id, {
      status,
      admin_responded_at: new Date(),
      admin_decision: action === "approve" ? "approved" : "rejected",
      buyer_deadline_input_shipment: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  // 3. Buyer minta konfirmasi (setelah retur)
  if (complaint.status === "awaiting_admin_confirmation") {
    const status =
      action === "approve"
        ? "awaiting_seller_confirmation"
        : "return_in_transit";

    return await complaintRepo.updateComplaint(id, {
      status,
      request_confirmation_status:
        action === "approve" ? "approved" : "rejected",
      request_confirmation_admin_id: adminId,
      admin_responded_at: new Date(),
      admin_approved_confirmation_at:
        action === "approve" ? new Date() : undefined,
      admin_rejected_confirmation_at:
        action === "reject" ? new Date() : undefined,
      seller_confirm_deadline:
        action === "approve"
          ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          : undefined,
    });
  }

  throwError("Pengaduan tidak dalam status yang dapat direspon", 400);
};

export default {
  getAllComplaintList,
  getComplaintById,
  responseComplaint,
};
