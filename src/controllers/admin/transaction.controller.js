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
  const transactions =
    await adminTransactionService.getAllTransactionsForAdmin();
  return resSuccess(
    res,
    200,
    "Daftar transaksi berhasil diambil",
    transactions
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
    adminId,
  );
  return resSuccess(res, 200, "Permintaan rilis dana berhasil diperbarui");
}

export default {
  getTransactionDetailById,
  getAllTransactions,
  updateFundReleaseRequestStatus
};
