import adminTransactionService from "../../services/admin/transaction.service.js";
import resSuccess from "../../utils/response.js";
import throwError from "../../utils/throwError.js";

const getTransactionDetailById = async (req, res) => {
  const { transactionId } = req.params;
  const transaction = await adminTransactionService.getTransactionDetailByAdmin(
    transactionId
  );
  return resSuccess(res, 200, "Detail transaksi berhasil diambil", transaction);
};

const getAllTransactions = async (req, res) => {
  let {
    status,
    fundReleaseStatus,
    createdFrom,
    createdTo,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  if (typeof status === "string") {
    status = status.split(",");
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const { transactions, totalCount } =
    await adminTransactionService.getAllTransactionsForAdmin({
      status,
      fundReleaseStatus,
      createdFrom,
      createdTo,
      search,
      skip,
      take,
    });

  return resSuccess(
    res,
    200,
    "Daftar transaksi berhasil diambil",
    transactions,
    {
      page: Number(page),
      limit: Number(limit),
      totalCount,
    }
  );
};

const updateFundReleaseRequestStatus = async (req, res) => {
  const { transactionId, action } = req.params;
  const adminId = req.user.id;
  if (action !== "approve" && action !== "reject") {
    throwError("Aksi tidak valid. Gunakan 'approve' atau 'reject'", 400);
  }
  const status = action === "approve" ? "approved" : "rejected";
  await adminTransactionService.updateFundReleaseRequest(
    transactionId,
    status,
    adminId
  );
  return resSuccess(res, 200, "Permintaan rilis dana berhasil diperbarui");
};

export default {
  getTransactionDetailById,
  getAllTransactions,
  updateFundReleaseRequestStatus,
};
