import complaintService from "../../services/seller/complaint.service.js";
import resSuccess from "../../utils/response.js";

const patchSellerResponse = async (req, res) => {
    const {transactionId} = req.params;
    const {status, seller_response_reason} = req.body;
    const {sellerId} = req.user.id
    const photo = req.files;
    // const sellerId = req.user.id;

    const updatedComplaint = await complaintService.patchSellerResponse(
        transactionId,
        status,
        sellerId,
        photo,
        seller_response_reason,
    )

    return resSuccess(res, 200, "Berhasil memperbarui respons penjual", updatedComplaint);
}

export default {
    patchSellerResponse,
};