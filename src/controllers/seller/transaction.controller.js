import sellerTransactionService from "../../services/seller/transaction.service.js";
import resSuccess from "../../utils/response.js";

const getTransactionDetailSeller = async (req, res) => {
  const { transactionId } = req.params;
  const sellerId = req.user.id;
  const data = await sellerTransactionService.getTransactionDetailBySeller(
    transactionId,
    sellerId
  );
  if (transactionId) {
    return resSuccess(res, 200, "Detail transaksi seller berhasil diambil", data);
  } else {
    return resSuccess(res, 200, "List transaksi seller berhasil diambil", data);
  }
  
};

const generateTransaction = async (req, res) => {
  const {
    buyer_id,
    item_name,
    item_price,
    status,
    virtual_account_number,
    withdrawal_bank_account_id
  } = req.body;
  const seller_id = req.user.id;

  const newTransaction = await sellerTransactionService.generateTransaction({
    seller_id,
    buyer_id,
    item_name,
    item_price,
    status,
    virtual_account_number,
    withdrawal_bank_account_id
  });

  return resSuccess(res, 201, "Transaksi berhasil dibuat", newTransaction);
}

export default {
  getTransactionDetailSeller,
  generateTransaction,
};
