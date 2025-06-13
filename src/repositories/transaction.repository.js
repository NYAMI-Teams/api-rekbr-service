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
      shipment: {
        include: {
          courier: true,
        },
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
      buyer: { select: { email: true } },
      withdrawal_bank_account: {
        include: { bank: true },
      },
      shipment: {
        include: {
          courier: true,
        },
      },
    },
  });
};

const getTransactionDetailByAdmin = async (transactionId) => {
  return await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      buyer: { select: { email: true } },
      seller: { select: { email: true } },
      withdrawal_bank_account: {
        include: { bank: true },
      },
      shipment: {
        include: {
          courier: true,
        },
      },
    },
  });
};

const getAllTransactionsForAdmin = async () => {
  return await prisma.transaction.findMany({
    include: {
      buyer: { select: { email: true } },
      seller: { select: { email: true } },
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

const updatePaidTransaction = async (
  transactionId,
  buyerId,
  paidAt,
  shipmentDeadline
) => {
  return await prisma.transaction.updateMany({
    where: {
      id: transactionId,
      buyer_id: buyerId,
    },
    data: {
      status: "waiting_shipment",
      paid_at: paidAt,
      shipment_deadline: shipmentDeadline,
    },
  });
};

const updateStatusToShipped = async (transactionId) => {
  return await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: "shipped" },
  });
};

const confirmReceived = async (transactionId, buyerId, confirmedAt) => {
  return await prisma.transaction.updateMany({
    where: {
      id: transactionId,
      buyer_id: buyerId,
      status: "shipped",
    },
    data: {
      status: "completed",
      confirmed_at: confirmedAt,
    },
  });
};

const cancelTransactionBySeller = async (transactionId, sellerId) => {
  return await prisma.transaction.updateMany({
    where: {
      id: transactionId,
      seller_id: sellerId,
      status: {
        in: ["pending_payment", "waiting_shipment"],
      },
    },
    data: {
      status: "cancelled",
      cancelled_at: new Date(),
    },
  });
};

const getTransactionListForSeller = async (sellerId) => {
  return await prisma.transaction.findMany({
    where: { seller_id: sellerId },
    orderBy: { created_at: "desc" },
    include: {
      buyer: {
        select: { email: true },
      },
    },
  });
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
};
