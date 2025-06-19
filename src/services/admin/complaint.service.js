import complaintRepository from "../../repositories/complaint.repository.js";
import throwError from "../../utils/throwError.js";

const getAllComplaintList =  async (type, status) => {
    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;
    const complaints = await complaintRepository.getAllComplaintList(filters);
    if (!complaints || complaints.length === 0) {
        throwError("Tidak ada daftar pengaduan yang ditemukan", 404);
    }
    return complaints
}

const getComplaintById = async (id) => {
    const complaint = await complaintRepository.getComplaintById(id);
    if (!complaint) {
        throwError("Pengaduan tidak ditemukan", 404);
    }
    return complaint;
}

export default {
    getAllComplaintList,
    getComplaintById
}
