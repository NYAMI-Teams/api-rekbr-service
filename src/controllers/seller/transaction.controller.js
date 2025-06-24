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

const getTransactionListSeller = async (req, res) => {
  const sellerId = req.user.id;
  // const { isHistory } = req.query || null

  const statusArray = req.query.status
    ? Array.isArray(req.query.status)
      ? req.query.status
      : [req.query.status]
    : null;

  const { offset, limit } = req.query;

  const data = await sellerTransactionService.getTransactionListBySeller(
    sellerId,
    statusArray,
    parseInt(offset),
    parseInt(limit)
  );

  const message =
    data.length === 0
      ? "Transaksi tidak ada"
      : "List transaksi seller berhasil diambil";

  return resSuccess(res, 200, message, data);
};

const generateTransaction = async (req, res) => {
  const {
    email,
    item_name,
    item_price,
    withdrawal_bank_account_id,
    isInsurance,
  } = req.body;
  const seller_id = req.user.id;

  const newTransaction = await sellerTransactionService.generateTransaction({
    seller_id,
    item_name,
    item_price,
    withdrawal_bank_account_id,
    email,
    isInsurance,
  });

  return resSuccess(res, 201, "Transaksi berhasil dibuat", newTransaction);
};

const inputShipment = async (req, res) => {
  const { transactionId } = req.params;
  const sellerId = req.user.id;
  const { courier_id, tracking_number } = req.body;
  const photo = req.file;

  const result = await sellerTransactionService.inputShipment(
    transactionId,
    sellerId,
    courier_id,
    tracking_number,
    photo
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

const getCourierList = async (req, res) => {
  const couriers = await sellerTransactionService.courierList();
  return resSuccess(res, 200, "List kurir berhasil diambil", couriers);
};

export default {
  getTransactionDetailSeller,
  getTransactionListSeller,
  confirmationShipmentRequest,
  generateTransaction,
  cancelTransactionBySeller,
  inputShipment,
  getCourierList,
};
