import prisma from "../prisma/client.js";

const createFundReleaseRequest = async ({
  transactionId,
  sellerId,
  evidenceUrl,
  reason,
  status = "requested",
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

export default {
  createFundReleaseRequest,
  getFundReleaseRequestByTransaction,
};
