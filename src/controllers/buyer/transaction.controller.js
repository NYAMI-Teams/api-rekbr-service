import buyerTransactionService from "../../services/buyer/transaction.service.js";
import resSuccess from "../../utils/response.js";

const getTransactionDetailBuyer = async (req, res) => {
  const { transactionId } = req.params;
  const buyerId = req.user.id;
  const data = await buyerTransactionService.getTransactionDetailByBuyer(
    transactionId,
    buyerId
  );
  return resSuccess(res, 200, "Detail transaksi buyer berhasil diambil", data);
};

const simulatePayment = async (req, res) => {
  const { transactionId } = req.params;
  const buyerId = req.user.id;
  const data = await buyerTransactionService.simulatePayment(
    transactionId,
    buyerId
  );
  return resSuccess(res, 200, "Pembayaran simulasi berhasil", data);
};

const confirmReceived = async (req, res) => {
  const { transactionId } = req.params;
  const buyerId = req.user.id;

  const result = await buyerTransactionService.confirmReceived(
    transactionId,
    buyerId
  );
  return resSuccess(res, 200, "Barang berhasil dikonfirmasi diterima", result);
};

const getTransactionListBuyer = async (req, res) => {
  const buyerId = req.user.id;
  const statusArray = req.query.status
    ? Array.isArray(req.query.status)
      ? req.query.status
      : [req.query.status]
    : null;

  console.log(statusArray, "ini status array");

  const data = await buyerTransactionService.getTransactionListByBuyer(
    buyerId,
    statusArray
  );

  const message =
    data.length === 0
      ? "Transaksi tidak ada"
      : "List transaksi seller berhasil diambil";

  return resSuccess(res, 200, message, data);
};

export default {
  getTransactionDetailBuyer,
  simulatePayment,
  confirmReceived,
  getTransactionListBuyer,
};
