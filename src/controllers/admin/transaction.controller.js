import adminTransactionService from "../../services/admin/transaction.service.js";
import resSuccess from "../../utils/response.js";

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

export default {
  getTransactionDetailById,
  getAllTransactions,
};
