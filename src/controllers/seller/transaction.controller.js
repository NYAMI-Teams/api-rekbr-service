import sellerTransactionService from "../../services/seller/transaction.service.js";
import uploadToSpaces from "../../services/digital-storage.service.js";
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

const cancelTransactionBySeller = async (req, res) => {
  const { transactionId } = req.params;
  const sellerId = req.user.id;

  const result = await sellerTransactionService.cancelTransactionBySeller(
    transactionId,
    sellerId
  );

  return resSuccess(res, 200, "Transaksi berhasil dibatalkan", result);
};

const confirmationShipmentRequest = async (req, res) => {
  const { transactionId } = req.params;
  const { reason } = req.body;
  const sellerId = req.user.id;
  const evidence = req.file;

  await sellerTransactionService.confirmationShipmentRequest({
    transactionId,
    sellerId,
    evidence,
    reason,
  });
  return resSuccess(
    res,
    200,
    "Permintaan konfirmasi pengiriman berhasil dibuat"
  );
};

export default {
  getTransactionDetailSeller,
  confirmationShipmentRequest,
};
