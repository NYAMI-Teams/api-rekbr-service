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
      Complaint: {
        include: {
          return_shipment: {
            include: {
              courier: true,
            },
          },
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
      Complaint: {
        include: {
          return_shipment: {
            include: {
              courier: true,
            },
          },
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
    whereClause.status = Array.isArray(status) ? { in: status } : status;
  }

  if (createdFrom || createdTo) {
    const createdToDate = createdTo
      ? new Date(new Date(createdTo).setHours(23, 59, 59, 999))
      : undefined;

    whereClause.created_at = {
      ...(createdFrom && { gte: new Date(createdFrom) }),
      ...(createdToDate && { lte: createdToDate }),
    };
  }

  if (search) {
    whereClause.OR = [
      { transaction_code: { contains: search, mode: "insensitive" } },
      { item_name: { contains: search, mode: "insensitive" } },
      { buyer: { email: { contains: search, mode: "insensitive" } } },
      { seller: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Ambil semua transaksi (tanpa pagination) dan fund releases
  const [rawTransactions, fundReleases] = await Promise.all([
    prisma.transaction.findMany({
      where: whereClause,
      include: {
        buyer: { select: { email: true } },
        seller: { select: { email: true } },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.fundReleaseRequest.findMany(),
  ]);

  // Buat map fundRelease per transaksi
  const frMap = {};
  fundReleases.forEach((fr) => {
    frMap[fr.transaction_id] = fr;
  });

  // Filter manual berdasarkan fundReleaseStatus
  const filtered = rawTransactions.filter((txn) => {
    const fr = frMap[txn.id];
    if (!fundReleaseStatus) return true;
    if (fundReleaseStatus === "none") return !fr;
    return fr?.status === fundReleaseStatus;
  });

  const totalCount = filtered.length;

  const paginated = filtered.slice(skip, skip + take);

  const mapped = paginated.map((txn) => {
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
    transactions: mapped,
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

const getTransactionListForSeller = async (
  sellerId,
  statusArray,
  offset,
  limit
) => {
  return await prisma.transaction.findMany({
    where: {
      seller_id: sellerId,
      ...(statusArray && statusArray.length > 0
        ? { status: { in: statusArray } }
        : {}),
    },
    orderBy: { created_at: "desc" },
    include: {
      buyer: {
        select: { email: true },
      },
      shipment: {
        include: {
          courier: true,
        },
      },
      Complaint: {
        take: 1, // 1 most recent complaint
        orderBy: {
          created_at: "desc",
        },
        include: {
          return_shipment: {
            include: {
              courier: true,
            },
          },
        },
      },
    },
    skip: offset || 0,
    take: limit || 100,
  });
};

const findActiveTransaction = async ({ seller_id, buyer_id }) => {
  const activeTransaction = await prisma.transaction.findFirst({
    where: {
      seller_id,
      buyer_id,
      status: {
        notIn: ["completed", "canceled", "refunded"],
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

const getTransactionListForBuyer = async (
  buyerId,
  statusArray,
  offset,
  limit
) => {
  return await prisma.transaction.findMany({
    where: {
      buyer_id: buyerId,
      ...(statusArray && statusArray.length > 0
        ? { status: { in: statusArray } }
        : {}),
    },
    orderBy: { created_at: "desc" },
    include: {
      seller: {
        select: { email: true },
      },
      shipment: {
        include: {
          courier: true,
        },
      },
      Complaint: {
        take: 1, // 1 most recent complaint
        orderBy: {
          created_at: "desc",
        },
        include: {
          return_shipment: {
            include: {
              courier: true,
            },
          },
        },
      },
    },
    skip: offset || 0,
    take: limit || 100,
  });
};

const findTransactionById = async (transactionId) => {
  return await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
};

const updateStatusAndClearConfirmDeadline = async (
  transactionId,
  newStatus
) => {
  return await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: newStatus,
    },
  });
};

const updateStatus = async (transactionId, status) => {
  return await prisma.transaction.update({
    where: { id: transactionId },
    data: { status },
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
  getTransactionListForBuyer,
  findTransactionById,
  updateStatusAndClearConfirmDeadline,
  updateStatus,
};
