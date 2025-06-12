import throwError from "../../utils/throwError.js";
import transactionRepo from "../../repositories/transaction.repository.js";

const getTransactionDetailBySeller = async (transactionId, sellerId) => {
  const txn = await transactionRepo.getTransactionDetailBySeller(
    transactionId,
    sellerId
  );
  if (!txn) throwError("Transaksi tidak ditemukan atau bukan milik Anda", 404);

  return {
    id: txn.id,
    transactionCode: txn.transaction_code,
    status: txn.status,
    itemName: txn.item_name,
    itemPrice: txn.item_price,
    insuranceFee: txn.insurance_fee,
    platformFee: txn.platform_fee,
    totalAmount: txn.total_amount,
    virtualAccount: txn.virtual_account_number,
    buyerEmail: txn.buyer?.email || null,
    createdAt: txn.created_at,
    paidAt: txn.paid_at,
    paymentDeadline: txn.payment_deadline,
    shipmentDeadline: txn.shipment_deadline,
    shipmentDate: txn.paid_at
      ? new Date(txn.paid_at.getTime() + 86400000).toISOString()
      : null,
    shipment: {
      trackingNumber: "DUMMY-TRACK",
      courier: "JNE REG",
    },
    fundReleaseRequest: {
      requested: true,
      status: "approved",
      requestedAt: new Date().toISOString(),
      resolvedAt: new Date(Date.now() + 3600000).toISOString(),
    },
    buyerConfirmedAt: txn.confirmed_at,
    rekeningSeller: {
      bankName: txn.withdrawal_bank_account?.bank?.bank_name || null,
      accountNumber: txn.withdrawal_bank_account?.account_number || null,
      logoUrl: txn.withdrawal_bank_account?.bank?.logo_url || null,
    },
    currentTimestamp: new Date().toISOString(),
  };
};

const generateTransactionCode = () => {
  const prefix = "TRX";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
};




const generateTransaction = async ({seller_id,
  buyer_id,
  item_name,
  item_price,
  status,
  virtual_account_number,
  withdrawal_bank_account_id}) => {

    // plt fee, insurance fee, dan total amount are hardcoded for simplicity
    const platform_fee = 25000;
    const insurance_fee = 5000;
    const total_amount = item_price + platform_fee + insurance_fee;

    //payment deadline also hardocdeed
    const payment_deadline = new Date(Date.now() + 2 * 60 * 60 * 1000)
    const created_at = new Date(Date.now());

    const existingTransaction = await transactionRepo.findActiveTransaction({
      seller_id,
      buyer_id,
    });
    if (existingTransaction) {
      throwError(`Transaksi aktif sudah ada untuk seller dan buyer ini dengan ID ${existingTransaction.transactionCode}`, 400);
    }
    const transaction_code = generateTransactionCode();
    
    const newTransaction = await transactionRepo.createTransaction({
      transaction_code,
      seller_id,
      buyer_id,
      item_name,
      item_price,
      platform_fee,
      insurance_fee,
      total_amount,
      status,
      virtual_account_number,
      payment_deadline,
      withdrawal_bank_account_id,
      created_at,
    });

    return newTransaction;
  }

export default {
  getTransactionDetailBySeller,
  generateTransaction,
  generateTransactionCode,
};
