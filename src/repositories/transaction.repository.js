import prisma from "../prisma/client.js";
import toCamelCase from "../utils/camelCaseResponse.js";

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

const getTransactionDetailBySeller = async (transactionId = null, sellerId) => {
  const query = {
    where: {
      seller_id: sellerId,
      ...(transactionId && { id: transactionId}),
      
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
  }

  if (transactionId) {
    return await prisma.transaction.findFirst(query);
  } else {
    return await prisma.transaction.findMany(query);
  }
};

const findActiveTransaction = async ({ seller_id, buyer_id }) => {
  const activeTransaction = await prisma.transaction.findFirst({
    where: {
      seller_id,
      buyer_id,
      status: {
        notIn: ["completed", "canceled"],
      },
    },
  });
  return activeTransaction ? toCamelCase(activeTransaction) : null;
};

const createTransaction = async ({
  transaction_code,
  seller_id,
  buyer_id,
  item_name,
  item_price,
  platform_fee,
  insurance_fee,
  total_amount,
  status,
  virtual_account_number,
  payment_deadline,
  withdrawal_bank_account_id,
}) => {
  const newTransaction = await prisma.transaction.create({
    data: {
      transaction_code,
      seller_id,
      buyer_id,
      item_name,
      item_price,
      platform_fee,
      insurance_fee,
      total_amount,
      status,
      virtual_account_number,
      payment_deadline,
      withdrawal_bank_account_id,
    },
  });

  return toCamelCase(newTransaction);
};

export default {
  getTransactionDetailByBuyer,
  getTransactionDetailBySeller,
  createTransaction,
  findActiveTransaction,
};
