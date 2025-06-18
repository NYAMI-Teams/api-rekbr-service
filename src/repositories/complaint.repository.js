import prisma from "../prisma/client.js";

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

export default {
  createComplaint,
  findComplaintByTransaction,
  updateComplaintStatus,
  findComplaintById,
  getComplaintsByBuyer,
  getComplaintDetail,
};
