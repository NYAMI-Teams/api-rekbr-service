import sellerTransactionService from "../../services/seller/transaction.service.js";
import uploadToSpaces from "../../services/digital-storage.service.js";
import resSuccess from "../../utils/response.js";

const getTransactionDetailSeller = async (req, res) => {
  const { transactionId } = req.params;
  const sellerId = "46dca94f-4c79-4d45-99ed-10e2f900441a";
  const data = await sellerTransactionService.getTransactionDetailBySeller(
    transactionId,
    sellerId
  );
  return resSuccess(res, 200, "Detail transaksi seller berhasil diambil", data);
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
    reason
  });
  return resSuccess(res, 200, "Permintaan konfirmasi pengiriman berhasil dibuat");
}

export default {
  getTransactionDetailSeller,
  confirmationShipmentRequest
};
