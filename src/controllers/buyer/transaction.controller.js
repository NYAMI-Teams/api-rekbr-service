import buyerTransactionService from "../../services/buyer/transaction.service.js";
import { resSuccess } from "../../utils/response.js";

const getTransactionDetailBuyer = async (req, res) => {
  const { transactionId } = req.params;
  const buyerId = "46dca94f-4c79-4d45-99ed-10e2f900441a";
  const data = await buyerTransactionService.getTransactionDetailByBuyer(
    transactionId,
    buyerId
  );
  return resSuccess(res, "Detail transaksi buyer berhasil diambil", data, 200);
};

export default {
  getTransactionDetailBuyer,
};
