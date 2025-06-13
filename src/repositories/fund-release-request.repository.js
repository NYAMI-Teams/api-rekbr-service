import prisma from "../prisma/client.js";

const createFundReleaseRequest = async ({ transactionId, sellerId, evidenceUrl, reason, status="requested", }) => {
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

export default {
    createFundReleaseRequest,
};