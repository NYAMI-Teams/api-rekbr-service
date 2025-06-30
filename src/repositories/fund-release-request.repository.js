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
    orderBy: { created_at: "desc" }, //get latest seusai request mas danil
    include: {
      admin: { select: { email: true } },
      transaction: {
        select: {
          buyer_id: true,
          seller_id: true,
        },
      },
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
