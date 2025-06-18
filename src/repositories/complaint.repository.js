import prisma from "../prisma/client.js";
import toCamelCase from "../utils/camelCaseResponse.js";

const sellerResponseUpdate = async (transaction_id, status) => {
  return await prisma.complaint.update({
    where: { transaction_id },
    data: {
      status: status,
    },
  });
};

export default {
    sellerResponseUpdate,
}