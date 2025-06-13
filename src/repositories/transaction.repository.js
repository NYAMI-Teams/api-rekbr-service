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

export default {
  getTransactionDetailByBuyer,
  getTransactionDetailBySeller,
  getTransactionDetailByAdmin,
  getAllTransactionsForAdmin,
  updatePaidTransaction,
  updateStatusToShipped,
  confirmReceived,
  cancelTransactionBySeller,
};
