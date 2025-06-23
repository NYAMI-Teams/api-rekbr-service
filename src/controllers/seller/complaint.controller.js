import complaintService from "../../services/seller/complaint.service.js";
import resSuccess from "../../utils/response.js";

const patchSellerResponse = async (req, res) => {
  const { complaintId } = req.params;
  const { status, seller_response_reason } = req.body;
  const sellerId = req.user.id;
  const photo = req.files;

  console.log(complaintId, "ini complaintId");

  const updatedComplaint = await complaintService.patchSellerResponse({
    status,
    sellerId,
    photo,
    seller_response_reason,
    complaintId,
  });

  return resSuccess(
    res,
    200,
    "Berhasil memperbarui respons penjual",
    updatedComplaint
  );
};

const patchSellerItemReceive = async (req, res) => {
  const { complaintId } = req.params;
  const { status } = req.body;
  const sellerId = req.user.id;

  const updatedComplaint = await complaintService.patchSellerItemReceive(
    complaintId,
    status,
    sellerId
  );

  return resSuccess(
    res,
    200,
    "Berhasil memperbarui status penerimaan barang",
    updatedComplaint
  );
};

const getComplaintListBySeller = async (req, res) => {
  const sellerId = req.user.id;
  const complaints = await complaintService.getComplaintListBySeller(sellerId);
  return resSuccess(res, 200, "Daftar komplain berhasil diambil", complaints);
};

const getComplaintDetailBySeller = async (req, res) => {
  const { complaintId } = req.params;
  const sellerId = req.user.id;
  const complaint = await complaintService.getComplaintDetailBySeller(
    complaintId,
    sellerId
  );
  return resSuccess(res, 200, "Detail komplain berhasil diambil", complaint);
};

export default {
  patchSellerResponse,
  patchSellerItemReceive,
  getComplaintListBySeller,
  getComplaintDetailBySeller,
};
