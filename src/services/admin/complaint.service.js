import complaintRepository from "../../repositories/complaint.repository.js";
import throwError from "../../utils/throwError.js";

const getAllComplaintList =  async (type, status) => {
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

const responseComplaint = async (id, status) => {
    const complaint = await complaintRepository.getComplaintById(id);
    if (!complaint) {
        throwError("Pengaduan tidak ditemukan", 404);
    }
    if (complaint.status !== "under_investigation") {
        throwError("Pengaduan tidak dalam status yang dapat direspon", 400);
    }
    const updatedComplaint = await complaintRepository.updateComplaintStatus(id, status);
    if (!updatedComplaint) {
        throwError("Gagal memperbarui status pengaduan", 500);
    }
}

export default {
    getAllComplaintList,
    getComplaintById,
    responseComplaint
}
