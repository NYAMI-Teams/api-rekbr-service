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

export default {
    getAllComplaintList,
}
