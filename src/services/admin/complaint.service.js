import throwError from "../../utils/throwError.js";
import complaintRepo from "../../repositories/complaint.repository.js";
import transactionRepo from "../../repositories/transaction.repository.js";
import { scheduleAutoCompleteConfirmation } from "../../jobs/complaint.scheduler.js";
import prisma from "../../prisma/client.js";

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
      if (action === "reject") {
        await transactionRepo.updateStatusToShipped(
          complaint.transaction.id,
          tx
        );
      }

      return await complaintRepo.updateComplaint(
        id,
        {
          status,
          admin_responded_at: new Date(),
          admin_decision: action === "approve" ? "approved" : "rejected",
          buyer_deadline_input_shipment: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ),
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
        deadline = new Date(Date.now() + 2 * 60 * 1000); // 2 menit dari sekarang
        await scheduleAutoCompleteConfirmation(id, deadline.getTime());
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
