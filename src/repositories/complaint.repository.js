import prisma from "../prisma/client.js";

const createComplaint = async (payload) => {
  return await prisma.complaint.create({
    data: {
      ...payload,
      seller_response_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 hari ke depan
    },
  });
};
const findComplaintByTransaction = async (transactionId) => {
  return await prisma.complaint.findFirst({
    where: { transaction_id: transactionId },
    orderBy: { created_at: "desc" },
  });
};

const updateComplaintStatus = async (complaintId, status) => {
  return await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status,
      canceled_by_buyer_at: status === "canceled_by_buyer" ? new Date() : null,
      resolved_at: new Date(),
    },
  });
};

const findComplaintById = async (complaintId) => {
  return await prisma.complaint.findUnique({
    where: { id: complaintId },
  });
};

const getComplaintsByBuyer = async (buyerId, offset, limit) => {
  return await prisma.complaint.findMany({
    where: { buyer_id: buyerId },
    orderBy: { created_at: "desc" },
    include: {
      return_shipment: {
        include: {
          courier: true,
        },
      },
      transaction: {
        include: {
          seller: { select: { email: true } },
          shipment: { include: { courier: true } },
        },
      },
    },
    skip: offset || 0,
    take: limit || 100,
  });
};

const getComplaintDetail = async (complaintId) => {
  return await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: {
      transaction: {
        include: {
          buyer: { select: { email: true } },
          seller: { select: { email: true } }, // add this
          shipment: { include: { courier: true } },
        },
      },
      return_shipment: {
        include: {
          courier: true,
        },
      },
    },
  });
};

const getComplaintsBySeller = async (sellerId, offset, limit) => {
  return await prisma.complaint.findMany({
    where: { transaction: { seller_id: sellerId } },
    orderBy: { created_at: "desc" },
    include: {
      transaction: {
        include: {
          buyer: { select: { email: true } },
          shipment: { include: { courier: true } },
        },
      },
      return_shipment: {
        include: {
          courier: true,
        },
      },
    },
    skip: offset || 0,
    take: limit || 100,
  });
};

const sellerResponseUpdate = async (
  complaintId,
  sellerDecision,
  photo,
  seller_response_reason,
  deadline // tambahan
) => {
  let status =
    sellerDecision === "approved"
      ? "return_requested"
      : "awaiting_admin_approval";

  return await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status,
      seller_decision: sellerDecision,
      seller_evidence_urls: photo && photo.length > 0 ? photo : [],
      seller_response_reason,
      seller_responded_at: new Date(),
      buyer_deadline_input_shipment: deadline || null, // simpan deadline
    },
  });
};

const getComplaintByTransactionId = async (transaction_id) => {
  return await prisma.complaint.findFirst({
    where: { transaction_id },
    orderBy: { created_at: "desc" },
  });
};

const sellerItemReceiveUpdate = async (complaintId, status, tx) => {
  return await tx.complaint.update({
    where: { id: complaintId },
    data: {
      status,
      seller_confirmed_return_at: new Date(),
      resolved_at: new Date(),
    },
  });
};

const complaintTransactionUpdate = async (complaintId, refundAmount, tx) => {
  const complaint = await findComplaintById(complaintId);
  if (!complaint) {
    throw new Error("Complaint not found");
  }

  return await tx.transaction.update({
    where: { id: complaint.transaction_id },
    data: {
      status: "refunded",
      refund_amount: refundAmount,
      refund_reason: complaint.buyer_reason,
      refunded_at: new Date(),
    },
  });
};

const complaintShipmentReceived = async (complaintId, tx) => {
  return await tx.returnShipment.update({
    where: { complaint_id: complaintId },
    data: {
      received_date: new Date(),
    },
  });
};

const updateReturnShipment = async (complaintId, data) => {
  return await prisma.returnShipment.create({
    data: {
      complaint_id: complaintId,
      ...data,
    },
  });
};

const getAllComplaintList = async (filters = {}) => {
  return await prisma.complaint.findMany({
    where: filters,
    orderBy: { created_at: "desc" },
    include: {
      buyer: { 
        select: { email: true } 
      },
      transaction: {
        select: {
          status: true,
          transaction_code: true,
          item_name: true,
          insurance_fee: true,
          shipment: {
            select: {
              tracking_number: true,
              courier: { select: { name: true } },
            },
          },
        },
      },
      return_shipment: {
        select: {
          tracking_number: true,
          courier: { select: { name: true } },
          shipment_date: true,
          received_date: true,
          photo_url: true,
        },
      },
    },
  });
};

const getComplaintById = async (complaintId) => {
  return await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: {
      transaction: {
        include: {
          buyer: {
            select: { email: true },
          },
          seller: {
            select: { email: true },
          },
          shipment: {
            include: {
              courier: true,
            },
          },
        },
      },
      return_shipment: {
        include: {
          courier: true,
        },
      },
    },
  });
};

const updateComplaintWithBuyerConfirmRequest = async (
  complaintId,
  reason,
  evidenceUrl
) => {
  return await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      buyer_requested_confirmation_at: new Date(),
      buyer_requested_confirmation_reason: reason,
      buyer_requested_confirmation_evidence_urls: [evidenceUrl],
      request_confirmation_status: "pending",
      status: "awaiting_admin_confirmation",
    },
  });
};

const updateComplaint = async (complaintId, data) => {
  return await prisma.complaint.update({
    where: { id: complaintId },
    data: { ...data },
  });
};

export default {
  createComplaint,
  findComplaintByTransaction,
  updateComplaintStatus,
  findComplaintById,
  getComplaintsByBuyer,
  getComplaintDetail,
  sellerResponseUpdate,
  getComplaintByTransactionId,
  sellerItemReceiveUpdate,
  complaintTransactionUpdate,
  updateReturnShipment,
  getAllComplaintList,
  getComplaintById,
  updateComplaintWithBuyerConfirmRequest,
  complaintShipmentReceived,
  updateComplaint,
  getComplaintsBySeller,
};
