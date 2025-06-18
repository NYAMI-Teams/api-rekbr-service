import buyerComplaintService from "../../services/buyer/complaint.service.js";
import resSuccess from "../../utils/response.js";

const createComplaint = async (req, res) => {
  const { transactionId } = req.params;
  const buyerId = req.user.id;
  const { type, reason } = req.body;
  const files = req.files || [];

  const complaint = await buyerComplaintService.createComplaint({
    transactionId,
    buyerId,
    type,
    reason,
    files,
  });

  return resSuccess(res, 201, "Komplain berhasil diajukan", complaint);
};

const cancelComplaint = async (req, res) => {
  const { complaintId } = req.params;
  const buyerId = req.user.id;

  const result = await buyerComplaintService.cancelComplaint({
    complaintId,
    buyerId,
  });

  return resSuccess(res, 200, "Komplain berhasil dibatalkan", result);
};

const getComplaintList = async (req, res) => {
  const buyerId = req.user.id;
  const complaints = await buyerComplaintService.getComplaintListByBuyer(
    buyerId
  );
  return resSuccess(res, 200, "Daftar komplain berhasil diambil", complaints);
};

const getComplaintDetail = async (req, res) => {
  const { complaintId } = req.params;
  const buyerId = req.user.id;
  const complaint = await buyerComplaintService.getComplaintDetail(
    complaintId,
    buyerId
  );
  return resSuccess(res, 200, "Detail komplain berhasil diambil", complaint);
};

export default {
  createComplaint,
  cancelComplaint,
  getComplaintList,
  getComplaintDetail,
};
