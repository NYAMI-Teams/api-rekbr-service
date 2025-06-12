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

export default {
  getTransactionDetailBuyer,
  simulatePayment,
  confirmReceived,
};
