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

const getComplaintListBuyer = async (req, res) => {
  const buyerId = req.user.id;
  const { offset, limit } = req.query;
  const complaints = await buyerComplaintService.getComplaintListByBuyer(
    buyerId,
    parseInt(offset),
    parseInt(limit)
  );
  return resSuccess(res, 200, "Daftar komplain berhasil diambil", complaints);
};

const getComplaintDetailBuyer = async (req, res) => {
  const { complaintId } = req.params;
  const buyerId = req.user.id;
  const complaint = await buyerComplaintService.getComplaintDetailByBuyer(
    complaintId,
    buyerId
  );
  return resSuccess(res, 200, "Detail komplain berhasil diambil", complaint);
};

const submitReturnShipment = async (req, res) => {
  const { complaintId } = req.params;
  const buyerId = req.user.id;
  const { courierId, trackingNumber } = req.body;
  const photo = req.file;

  const result = await buyerComplaintService.submitReturnShipment({
    complaintId,
    buyerId,
    courierId,
    trackingNumber,
    photo,
  });

  return resSuccess(res, 200, "Pengiriman retur berhasil dikirim", result);
};

const requestBuyerConfirmation = async (req, res) => {
  const { complaintId } = req.params;
  const buyerId = req.user.id;
  const { reason } = req.body;
  const file = req.file;

  const result = await buyerComplaintService.requestBuyerConfirmation({
    complaintId,
    buyerId,
    reason,
    file,
  });

  return resSuccess(
    res,
    200,
    "Permintaan konfirmasi ke admin berhasil dikirim",
    result
  );
};

export default {
  createComplaint,
  cancelComplaint,
  getComplaintListBuyer,
  getComplaintDetailBuyer,
  submitReturnShipment,
  requestBuyerConfirmation,
};
