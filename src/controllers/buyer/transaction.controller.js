import buyerTransactionService from "../../services/buyer/transaction.service.js";
import resSuccess from "../../utils/response.js";

const getTransactionDetailBuyer = async (req, res) => {
  const { transactionId } = req.params;
  const buyerId = "dd1964c4-5bf2-4414-87d1-0853bf02f14e";
  const data = await buyerTransactionService.getTransactionDetailByBuyer(
    transactionId,
    buyerId
  );
  return resSuccess(res, 200, "Detail transaksi buyer berhasil diambil", data);
};

const simulatePayment = async (req, res) => {
  const { transactionId } = req.params;
  const buyerId = "dd1964c4-5bf2-4414-87d1-0853bf02f14e";
  const data = await buyerTransactionService.simulatePayment(
    transactionId,
    buyerId
  );
  return resSuccess(res, "Pembayaran simulasi berhasil", data, 200);
};

export default {
  getTransactionDetailBuyer,
  simulatePayment,
};
