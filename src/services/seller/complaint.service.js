import throwError from "../../utils/throwError.js";
import complaintRepo from "../../repositories/complaint.repository.js";
import transactionRepo from "../../repositories/transaction.repository.js";


const patchSellerResponse = async (transactionId, status, sellerId) => {
//check if transaction exists
const transaction = await transactionRepo.getTransactionDetailBySeller(transactionId, sellerId);
    if (!transaction) {
    throwError("Transaksi tidak ditemukan", 404);
    }

//check if transaction is in shipped status
if (transaction.status !== "shipped") {
    throwError("Transaksi tidak dalam status 'shipped'", 400);
  }

//check if complaint already exists

if (status.toLowerCase() !== "return_requested" && status.toLowerCase() !== "rejected_by_seller") {
    throwError("Status tidak sesuai", 400);
  }

  const updatedComplaint = await complaintRepo.sellerResponseUpdate(
    transactionId,
    status
  );

  if (!updatedComplaint) {
    throwError("Gagal memperbarui respons penjual", 500);
  }
  return updatedComplaint;
}

export default {
  patchSellerResponse,
};