import complaintService from "../../services/seller/complaint.service.js";
import resSuccess from "../../utils/response.js";

const patchSellerResponse = async (req, res) => {
    const {transactionId} = req.params;
    const {status} = req.body;
    const {sellerId} = req.user.id
    // const sellerId = req.user.id;

    const updatedComplaint = await complaintService.patchSellerResponse(
        transactionId,
        status,
        sellerId,
    )

    return resSuccess(res, 200, "Berhasil memperbarui respons penjual", updatedComplaint);
}

export default {
    patchSellerResponse,
};