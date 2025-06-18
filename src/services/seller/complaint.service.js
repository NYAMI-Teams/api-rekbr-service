import throwError from "../../utils/throwError.js";
import complaintRepo from "../../repositories/complaint.repository.js";
import transactionRepo from "../../repositories/transaction.repository.js";
import digitalStorageService from "../digital-storage.service.js";

const patchSellerResponse = async ({status, photo, seller_response_reason, complaintId}) => {
  
  const existingComplaint = await complaintRepo.findComplaintById(
    complaintId
  );

  if (["return_requested"].includes(existingComplaint.status)) {
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
    complaintId,
    status,
    photoUrl,
    seller_response_reason
  );

  if (!updatedComplaint) {
    throwError("Gagal memperbarui respons penjual", 500);
  }
  return updatedComplaint;
};

const patchSellerItemReceive = async (complaintId, status, sellerId) => {
  // Check if complaint exists
  const existingComplaint = await complaintRepo.getComplaintDetail(complaintId);
  if (!existingComplaint) {
    throwError("Komplain tidak ditemukan", 404);
  }

  // Check if complaint is already completed or rejected
  if (
    ["completed", "rejected_by_seller", "rejected_by_admin"].includes(
      existingComplaint.status
    )
  ) {
    throwError("Komplain sudah termin harap membuat complaint baru", 400);
  }

  // check if complaint is approved by admin (will implement later)
  if (
    existingComplaint.request_confirmation_status.toLowerCase() !== "approved"
  ) {
    throwError("Admin menolak complaint", 400);
  }

// check current status of complaint
  if (
    existingComplaint.status.toLowerCase() !== "awaiting_seller_confirmation"
  ) {
    throwError("Status complaint tidak sesuai", 400);
  }

  if ( status.toLowerCase() !== "approved") {
    throwError("Status tidak sesuai", 400);
  }


  // Update the complaint status to 'item_received'
  const updatedComplaint = await complaintRepo.sellerItemReceiveUpdate(
    complaintId,
    status
  );

  // After complaint updated
const transactionId = existingComplaint.transaction_id;

const txnDetail = await transactionRepo.getTransactionDetailBySeller(transactionId, sellerId)

const refundAmount =
  Number(txnDetail.total_amount) -
  Number(txnDetail.platform_fee || 0) -
  Number(txnDetail.insurance_fee || 0);


  // After complaint updated — also update transaction table
  const updatedTransaction = await complaintRepo.complaintTransactionUpdate(complaintId, refundAmount);

  return {
    updatedComplaint,
    updatedTransaction,
  };
}

export default {
  patchSellerResponse,
  patchSellerItemReceive,
};
