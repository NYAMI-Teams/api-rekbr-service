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

const getTransactionListBySeller = async (sellerId) => {
  const txn = await transactionRepo.getTransactionListForSeller(
    sellerId
  );
 // Return empty array if no transactions (no throw)
 if (!txn || txn.length === 0) {
  return [];
}

  return txn.map((txn) => ({
    itemName: txn.item_name,
    totalAmount: txn.total_amount,
    buyerEmail: txn.buyer?.email || "-",
    virtualAccount: txn.virtual_account_number,
    status: txn.status,
    paymentDeadline: txn.payment_deadline,
    currentTimestamp: new Date().toISOString(),
  }));

};


const generateTransactionCode = () => {
  const prefix = "TRX";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
};




const generateTransaction = async ({
  seller_id,
  buyer_id,
  item_name,
  item_price,
  status,
  virtual_account_number,
  withdrawal_bank_account_id}) => {

    // plt fee, insurance fee, dan total amount are hardcoded for simplicity
    let platform_fee = 0;
    if (item_price >= 10000 && item_price < 499999) {
      platform_fee = 5000;
    }
    else if (item_price >= 500000 && item_price < 4999999){
      platform_fee = item_price * 0.01;
    }
    else if (item_price >= 5000000) {
      platform_fee = item_price * 0.008;
    } 
    else {
      throwError("Harga item tidak valid untuk transaksi", 400);
    }
    const insurance_fee = 0.002* item_price;
    const total_amount = item_price + platform_fee + insurance_fee;

    //payment deadline also hardocdeed
    const payment_deadline = new Date(Date.now() + 2 * 60 * 60 * 1000)
    const created_at = new Date(Date.now());

    //status is hardcoded to pending_payment
    status = "pending_payment";

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
  getTransactionListBySeller,
};
