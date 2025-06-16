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

const getAllTransactionsForAdmin = async ({
  status,
  fundReleaseStatus,
  createdFrom,
  createdTo,
  search,
  skip = 0,
  take = 10,
}) => {
  const whereClause = {};

  if (status) {
    if (Array.isArray(status)) {
      whereClause.status = { in: status };
    } else {
      whereClause.status = status;
    }
  }

  if (createdFrom && !createdTo) {
    const start = new Date(createdFrom);
    start.setHours(0, 0, 0, 0);
    const end = new Date(createdFrom);
    end.setHours(23, 59, 59, 999);
    whereClause.created_at = { gte: start, lte: end };
  } else if (createdFrom || createdTo) {
    whereClause.created_at = {};
    if (createdFrom) whereClause.created_at.gte = new Date(createdFrom);
    if (createdTo) whereClause.created_at.lte = new Date(createdTo);
  }

  if (search) {
    whereClause.OR = [
      { transaction_code: { contains: search, mode: "insensitive" } },
      { item_name: { contains: search, mode: "insensitive" } },
      { buyer: { email: { contains: search, mode: "insensitive" } } },
      { seller: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [transactions, totalCount, fundReleases] = await Promise.all([
    prisma.transaction.findMany({
      where: whereClause,
      include: {
        buyer: { select: { email: true } },
        seller: { select: { email: true } },
      },
      orderBy: { created_at: "desc" },
      skip,
      take,
    }),
    prisma.transaction.count({ where: whereClause }),
    prisma.fundReleaseRequest.findMany(),
  ]);

  const frMap = {};
  fundReleases.forEach((fr) => {
    frMap[fr.transaction_id] = fr;
  });

  const filteredTransactions = transactions
    .filter((txn) => {
      if (!fundReleaseStatus) return true;
      const fr = frMap[txn.id];
      if (fundReleaseStatus === "none") return !fr;
      return fr?.status === fundReleaseStatus;
    })
    .map((txn) => {
      const fr = frMap[txn.id];
      return {
        id: txn.id,
        transactionCode: txn.transaction_code,
        itemName: txn.item_name,
        itemPrice: txn.item_price,
        totalAmount: txn.total_amount,
        buyerEmail: txn.buyer?.email || null,
        sellerEmail: txn.seller?.email || null,
        status: txn.status,
        createdAt: txn.created_at,
        fundReleaseStatus: fr?.status || null,
      };
    });

  return {
    transactions: filteredTransactions,
    totalCount,
  };
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

const updateAfterBuyerConfirmation = async (
  transactionId,
  buyerId,
  confirmedAt,
  withdrawnAmount
) => {
  return await prisma.transaction.updateMany({
    where: {
      id: transactionId,
      buyer_id: buyerId,
      status: "shipped",
    },
    data: {
      status: "completed",
      confirmed_at: confirmedAt,
      withdrawn_at: new Date(),
      withdrawn_amount: withdrawnAmount,
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
      status: "canceled",
      cancelled_at: new Date(),
      cancel_reason: "Transaksi dibatalkan oleh penjual",
      cancelled_by_id: sellerId,
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
      shipment: {
        select: {
          tracking_number: true,
        },
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

const updateTransactionBuyerConfirmDeadline = async (
  transactionId,
  deadline
) => {
  return await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      buyer_confirm_deadline: deadline,
    },
  });
};

export default {
  getTransactionDetailByBuyer,
  getTransactionDetailBySeller,
  createTransaction,
  findActiveTransaction,
  getTransactionListForSeller,
  getTransactionDetailByAdmin,
  getAllTransactionsForAdmin,
  updatePaidTransaction,
  updateStatusToShipped,
  cancelTransactionBySeller,
  updateAfterBuyerConfirmation,
  updateTransactionBuyerConfirmDeadline,
};
