import { Router } from "express";
import authentication from "../../middlewares/authentication.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import complaintController from "../../controllers/buyer/complaint.controller.js";
import uploadImage from "../../middlewares/uploadImage.js";

const router = Router();

router.post(
  "/transactions/:transactionId/complaint",
  authentication,
  uploadImage.array("evidence", 5, 10),
  asyncHandler(complaintController.createComplaint)
);

router.post(
  "/complaints/:complaintId/cancel",
  authentication,
  asyncHandler(complaintController.cancelComplaint)
);

router.get(
  "/complaints",
  authentication,
  asyncHandler(complaintController.getComplaintList)
);

router.get(
  "/complaints/:complaintId",
  authentication,
  asyncHandler(complaintController.getComplaintDetail)
);

router.post(
  "/complaints/:complaintId/return",
  authentication,
  uploadImage.single("photo", 2),
  asyncHandler(complaintController.submitReturnShipment)
);

router.post(
  "/complaints/:complaintId/request-confirmation",
  authentication,
  uploadImage.single("evidence", 2),
  asyncHandler(complaintController.requestBuyerConfirmation)
);

export default router;

/**
 * @swagger
 * tags:
 *   name: BuyerComplaint
 *   description: Endpoints terkait komplain buyer
 */

/**
 * @swagger
 * /api/buyer/transactions/{transactionId}/complaint:
 *   post:
 *     summary: Membuat komplain baru untuk transaksi
 *     tags: [BuyerComplaint]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - reason
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [lost, damaged]
 *                 description: Tipe komplain
 *               reason:
 *                 type: string
 *                 description: Alasan komplain
 *               evidence:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Bukti komplain (opsional untuk tipe "lost")
 *     responses:
 *       201:
 *         description: Komplain berhasil diajukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Komplain berhasil diajukan"
 *                 data:
 *                   type: object
 *                   description: Detail komplain yang dibuat
 *       400:
 *         description: Permintaan tidak valid
 *       404:
 *         description: Transaksi tidak ditemukan atau bukan milik Anda
 */

/**
 * @swagger
 * /api/buyer/complaints/{complaintId}/cancel:
 *   post:
 *     summary: Membatalkan komplain
 *     tags: [BuyerComplaint]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID komplain
 *     responses:
 *       200:
 *         description: Komplain berhasil dibatalkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Komplain berhasil dibatalkan"
 *       400:
 *         description: Komplain tidak dapat dibatalkan
 *       404:
 *         description: Komplain tidak ditemukan atau bukan milik Anda
 */

/**
 * @swagger
 * /api/buyer/complaints:
 *   get:
 *     summary: Mendapatkan daftar komplain buyer
 *     tags: [BuyerComplaint]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar komplain berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   complaintId:
 *                     type: string
 *                   transactionId:
 *                     type: string
 *                   itemName:
 *                     type: string
 *                   price:
 *                     type: number
 *                   sellerEmail:
 *                     type: string
 *                   trackingNumber:
 *                     type: string
 *                   courier:
 *                     type: string
 *                   complaintType:
 *                     type: string
 *                   complaintStatus:
 *                     type: string
 *       404:
 *         description: Tidak ada komplain ditemukan
 */

/**
 * @swagger
 * /api/buyer/complaints/{complaintId}:
 *   get:
 *     summary: Mendapatkan detail komplain
 *     tags: [BuyerComplaint]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID komplain
 *     responses:
 *       200:
 *         description: Detail komplain berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 type:
 *                   type: string
 *                 buyer_reason:
 *                   type: string
 *                 buyer_evidence_urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                 seller_response_reason:
 *                   type: string
 *                 seller_evidence_urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                 timeline:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     transactionCode:
 *                       type: string
 *                     itemName:
 *                       type: string
 *                     totalAmount:
 *                       type: number
 *                     virtualAccount:
 *                       type: string
 *                     sellerEmail:
 *                       type: string
 *                     courier:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                     trackingNumber:
 *                       type: string
 *       404:
 *         description: Komplain tidak ditemukan atau bukan milik Anda
 */

/**
 * @swagger
 * /api/buyer/complaints/{complaintId}/return:
 *   post:
 *     summary: Mengirimkan pengembalian barang
 *     tags: [BuyerComplaint]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID komplain
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - courierId
 *               - trackingNumber
 *             properties:
 *               courierId:
 *                 type: string
 *                 description: ID kurir
 *               trackingNumber:
 *                 type: string
 *                 description: Nomor resi pengiriman
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Foto bukti pengiriman (opsional)
 *     responses:
 *       200:
 *         description: Pengiriman retur berhasil dikirim
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pengiriman retur berhasil dikirim"
 *       400:
 *         description: Komplain tidak dalam status pengembalian
 *       404:
 *         description: Komplain tidak ditemukan atau bukan milik Anda
 */

/**
 * @swagger
 * /api/buyer/complaints/{complaintId}/request-confirmation:
 *   post:
 *     summary: Meminta konfirmasi ke admin terkait pengembalian barang
 *     tags: [BuyerComplaint]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID komplain
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Alasan permintaan konfirmasi
 *               evidence:
 *                 type: string
 *                 format: binary
 *                 description: Bukti pengembalian barang
 *     responses:
 *       200:
 *         description: Permintaan konfirmasi ke admin berhasil dikirim
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Permintaan konfirmasi ke admin berhasil dikirim"
 *       400:
 *         description: Komplain belum dalam proses pengembalian
 *       404:
 *         description: Komplain tidak ditemukan atau bukan milik Anda
 */
