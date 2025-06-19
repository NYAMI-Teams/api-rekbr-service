import complaintRepository from "../../repositories/complaint.repository.js";
import transactionRepository from "../../repositories/transaction.repository.js";
import throwError from "../../utils/throwError.js";

const getAllComplaintList = async (type, status) => {
    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;
    const complaints = await complaintRepository.getAllComplaintList(filters);
    return complaints
}

const getComplaintById = async (id) => {
    const complaint = await complaintRepository.getComplaintById(id);
    if (!complaint) {
        throwError("Pengaduan tidak ditemukan", 404);
    }
    return complaint;
}

const responseComplaint = async (id, action, adminId) => {
    let status = "";
    const complaint = await complaintRepository.getComplaintById(id);
    if (!complaint) {
        throwError("Pengaduan tidak ditemukan", 404);
    }

    if (complaint.status == "under_investigation") {
        if (action === "approve") {
            status = "approved_by_admin";
        } 
        if (action === "reject") {
            status = "rejected_by_seller";
        }

        const updatedComplaint = await complaintRepository.updateComplaintStatus(id, status);
        if (!updatedComplaint) {
            throwError("Gagal memperbarui status pengaduan", 500);
        }
        return await complaintRepository.complaintTransactionUpdate(
            id,
            complaint.transaction.item_price
        );
    } 
    
    if (complaint.status == "awaiting_admin_confirmation") {
        let request_confirmation_status = "";
        if (action === "approve") {
            status = "awaiting_seller_confirmation";
            request_confirmation_status = "approved";
        } 
        if (action === "reject") {
            status = "rejected_by_admin";
            request_confirmation_status = "rejected";
        }
        const data = {
            status: status,
            request_confirmation_status: request_confirmation_status,
            request_confirmation_admin_id: adminId,
        }

        const updatedComplaint = await complaintRepository.updateComplaint(id, data);
        if (!updatedComplaint) {
            throwError("Gagal memperbarui status pengaduan", 500);
        }

        if (action === "reject") {
            await transactionRepository.updateStatusToShipped(complaint.transaction.id);
        }

        return true;
    }
    return throwError("Pengaduan tidak dalam status yang dapat direspon", 400);
}

export default {
    getAllComplaintList,
    getComplaintById,
    responseComplaint
}
