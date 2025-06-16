import prisma from "../prisma/client.js";

const createFundReleaseRequest = async ({
  transactionId,
  sellerId,
  evidenceUrl,
  reason,
  status = "pending",
}) => {
  return await prisma.fundReleaseRequest.create({
    data: {
      transaction_id: transactionId,
      seller_id: sellerId,
      evidence_url: evidenceUrl,
      reason: reason,
      status: status,
    },
  });
};

const getFundReleaseRequestByTransaction = async (transactionId) => {
  return await prisma.fundReleaseRequest.findFirst({
    where: { transaction_id: transactionId },
    include: {
      admin: { select: { email: true } },
    },
  });
};

const getAllFundReleaseRequests = async () => {
  return await prisma.fundReleaseRequest.findMany({
    include: {
      admin: { select: { email: true } },
    },
  });
};

const updateFundReleaseRequestStatus = async (id, status, adminId) => {
  return await prisma.fundReleaseRequest.update({
    where: { id },
    data: {
      status: status,
      admin_id: adminId,
      resolved_at: new Date(),
    },
  });
};

export default {
  createFundReleaseRequest,
  getFundReleaseRequestByTransaction,
  updateFundReleaseRequestStatus,
  getAllFundReleaseRequests,
};
