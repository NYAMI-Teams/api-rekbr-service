import throwError from "../../utils/throwError.js";
import complaintRepo from "../../repositories/complaint.repository.js";
import transactionRepo from "../../repositories/transaction.repository.js";
import digitalStorageService from "../digital-storage.service.js";

const patchSellerResponse = async (transactionId, status, sellerId, photo, seller_response_reason) => {
  //check if transaction exists
  const transaction = await transactionRepo.getTransactionDetailBySeller(
    transactionId,
    sellerId
  );
  if (!transaction) {
    throwError("Transaksi tidak ditemukan", 404);
  }

  //check if transaction is in shipped status
  if (transaction.status !== "shipped") {
    throwError("Transaksi tidak dalam status 'shipped'", 400);
  }

  //check if complaint already exists and ongoing
  const existingComplaint = await complaintRepo.getComplaintByTransactionId(
    transactionId
  );

  if (
    [
      "completed",
      "rejected_by_seller",
      "rejected_by_admin",
      "cancelled_by_buyer",
    ].includes(existingComplaint.status)
  ) {
    throwError("Komplain sudah termin harap membuat complaint baru", 400);
  }

  if (
    [
      "return_requested",
    ].includes(existingComplaint.status)
  ) {
    throwError("Komplain sedang dalam progress", 400);
  }

  if (
    status.toLowerCase() !== "return_requested" &&
    status.toLowerCase() !== "rejected_by_seller"
  ) {
    throwError("Status tidak sesuai", 400);
  }

  let photoUrl = [];
  if (photo && photo.length > 0) {
    photoUrl = await Promise.all(
      photo.map(async (photo) => {
        return await digitalStorageService.uploadToSpaces(
          photo.buffer,
          photo.originalname,
          photo.mimetype
        );
      })
    );
  }

  if (!seller_response_reason) {
    throwError("Alasan respons penjual tidak boleh kosong", 400);
  }

  const updatedComplaint = await complaintRepo.sellerResponseUpdate(
    transactionId,
    status,
    photoUrl,
    seller_response_reason
  );

  if (!updatedComplaint) {
    throwError("Gagal memperbarui respons penjual", 500);
  }
  return updatedComplaint;
};

export default {
  patchSellerResponse,
};
