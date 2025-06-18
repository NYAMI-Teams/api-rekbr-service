import prisma from "../prisma/client.js";
import toCamelCase from "../utils/camelCaseResponse.js";

const sellerResponseUpdate = async (transaction_id, status, photo, seller_response_reason) => {
  return await prisma.complaint.update({
    where: { transaction_id },
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
        created_at: 'desc',
      },
    });
  };

const sellerItemReceiveUpdate = async (transaction_id, status) => {
    return await prisma.complaint.update({
        where: { transaction_id},
        data: {
            
        }
    })
}
export default {
    sellerResponseUpdate,
    getComplaintByTransactionId,
}