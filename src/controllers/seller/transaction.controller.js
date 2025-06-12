import sellerTransactionService from "../../services/seller/transaction.service.js";
import resSuccess from "../../utils/response.js";

const getTransactionDetailSeller = async (req, res) => {
  const { transactionId } = req.params;
  const sellerId = req.user.id;
  const data = await sellerTransactionService.getTransactionDetailBySeller(
    transactionId,
    sellerId
  );
  return resSuccess(res, 200, "Detail transaksi seller berhasil diambil", data);
};

const inputShipment = async (req, res) => {
  const { transactionId } = req.params;
  const sellerId = req.user.id;
  const result = await sellerTransactionService.inputShipment(
    transactionId,
    sellerId,
    req.body
  );
  return resSuccess(res, 200, "Resi berhasil disimpan", result);
};

export default {
  getTransactionDetailSeller,
  inputShipment,
};
