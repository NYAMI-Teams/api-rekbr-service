import prisma from "../prisma/client.js";

const getTransactionDetailByBuyer = async (transactionId, buyerId) => {
  return await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      buyer_id: buyerId,
    },
    include: {
      seller: {
        select: { email: true },
      },
    },
  });
};

const getTransactionDetailBySeller = async (transactionId, sellerId) => {
  return await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      seller_id: sellerId,
    },
    include: {
      buyer: {
        select: { email: true },
      },
      withdrawal_bank_account: {
        include: {
          bank: true,
        },
      },
    },
  });
};

export default {
  getTransactionDetailByBuyer,
  getTransactionDetailBySeller,
};
