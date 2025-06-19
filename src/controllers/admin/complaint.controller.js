import complaintService from "../../services/admin/complaint.service.js"
import resSuccess from "../../utils/response.js";
import throwError from "../../utils/throwError.js";

const getAllComplaintList = async (req, res) => {
    const { type, status } = req.query;
    // Validate query parameters
    //   DAMAGED, LOST, NOT_AS_DESCRIBED
    if (type && !["damaged", "lost", "not_as_described"].includes(type)) {
        throwError("Invalid type parameter. Allowed values are 'damaged', 'lost', or 'not_as_described'.", 400);
    }
    //  WAITING_SELLER_APPROVAL, RETURN_REQUESTED, RETURN_IN_TRANSIT, AWAITING_SELLER_CONFIRMATION, COMPLETED, UNDER_INVESTIGATION, APPROVED_BY_SELLER, APPROVED_BY_ADMIN, REJECTED_BY_SELLER, REJECTED_BY_ADMIN, CANCELED_BY_BUYER
    if (status && !["waiting_seller_approval", "return_requested", "return_in_transit", "awaiting_seller_confirmation", "completed", "under_investigation", "approved_by_seller", "approved_by_admin", "rejected_by_seller", "rejected_by_admin", "canceled_by_buyer"].includes(status)) {
        throwError("Invalid status parameter. Allowed values are 'waiting_seller_approval', 'return_requested', 'return_in_transit', 'awaiting_seller_confirmation', 'completed', 'under_investigation', 'approved_by_seller', 'approved_by_admin', 'rejected_by_seller', 'rejected_by_admin', or 'canceled_by_buyer'.", 400);
    }
    const complaints = await complaintService.getAllComplaintList(type, status);
    return resSuccess(res, 200, "Daftar pengaduan berhasil diambil", complaints);   
}

export default {
    getAllComplaintList,
}
