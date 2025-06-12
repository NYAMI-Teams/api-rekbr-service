import sellerTransactionService from "../../services/seller/transaction.service.js";
import resSuccess from "../../utils/response.js";

const getTransactionDetailSeller = async (req, res) => {
  const { transactionId } = req.params;
  const sellerId = "46dca94f-4c79-4d45-99ed-10e2f900441a";
  const data = await sellerTransactionService.getTransactionDetailBySeller(
    transactionId,
    sellerId
  );
  return resSuccess(res, "Detail transaksi seller berhasil diambil", data, 200);
};

export default {
  getTransactionDetailSeller,
};
