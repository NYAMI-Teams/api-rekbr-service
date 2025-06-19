import prisma from "../prisma/client.js";
import toCamelCase from "../utils/camelCaseResponse.js";

const createComplaint = async (payload) => {
  return await prisma.complaint.create({
    data: payload,
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
      resolved_at: new Date(),
    },
  });
};

const findComplaintById = async (complaintId) => {
  return await prisma.complaint.findUnique({
    where: { id: complaintId },
  });
};

const getComplaintsByBuyer = async (buyerId) => {
  return await prisma.complaint.findMany({
    where: { buyer_id: buyerId },
    orderBy: { created_at: "desc" },
    include: {
      transaction: {
        include: {
          seller: { select: { email: true } },
          shipment: {
            include: { courier: true },
          },
        },
      },
    },
  });
};

const getComplaintDetail = async (complaintId) => {
  return await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: {
      transaction: {
        include: {
          seller: { select: { email: true } },
          shipment: {
            include: { courier: true },
          },
        },
      },
    },
  });
};

const sellerResponseUpdate = async (
  complaintId,
  status,
  photo,
  seller_response_reason
) => {
  console.log(status, "ini status");

  return await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status: status,
      seller_evidence_urls: photo && photo.length > 0 ? photo : [],
      seller_response_reason,
    },
  });
};

const getComplaintByTransactionId = async (transaction_id) => {
  return await prisma.complaint.findFirst({
    where: { transaction_id },
    orderBy: {
      created_at: "desc",
    },
  });
};

const sellerItemReceiveUpdate = async (complaintId, status) => {
  return await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status,
      resolved_at: new Date(),
    },
  });
};

const complaintTransactionUpdate = async (complaintId, refundAmount) => {
  const complaint = await findComplaintById(complaintId);
  if (!complaint) {
    throw new Error("Complaint not found");
  }

  return await prisma.transaction.update({
    where: { id: complaint.transaction_id },
    data: {
      status: "refunded",
      refund_amount: refundAmount,
      refund_reason: complaint.buyer_reason,
      refunded_at: new Date(),
    },
  });

}
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
    select: {
      id: true,
      type: true,
      status: true,
      created_at: true,
      buyer: { select: { email: true } },
      transaction: {
        select: {
          status: true,
          transaction_code: true,
          item_name: true,
          insurance_fee: true,
          shipment: {
            select: {
              tracking_number: true,
              courier: { select: { name: true } }
            }
          }
        }
      }
    }
  });
};

const getComplaintById = async (complaintId) => {
  return await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: {
      transaction: {
        include: {
          shipment: true
        }
      },
      return_shipment: true,
    }
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
};
