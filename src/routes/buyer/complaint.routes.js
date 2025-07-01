import { Router } from "express";
import authentication from "../../middlewares/authentication.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import complaintController from "../../controllers/buyer/complaint.controller.js";
import uploadImage from "../../middlewares/uploadImage.js";

const router = Router();

router.post(
  "/transactions/:transactionId/complaint",
  authentication,
  uploadImage.array("evidence", 5, 100),
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
  asyncHandler(complaintController.getComplaintListBuyer)
);

router.get(
  "/complaints/:complaintId",
  authentication,
  asyncHandler(complaintController.getComplaintDetailBuyer)
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
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset data (mulai dari 0)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Jumlah data per halaman
 *     responses:
 *       200:
 *         description: Daftar komplain berhasil diambil
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
 *                   example: "Daftar komplain berhasil diambil"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       buyerDeadlineInputShipment:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       sellerConfirmDeadline:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       returnShipment:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           trackingNumber:
 *                             type: string
 *                             nullable: true
 *                           courierName:
 *                             type: string
 *                             nullable: true
 *                       transaction:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           transactionCode:
 *                             type: string
 *                           itemName:
 *                             type: string
 *                           totalAmount:
 *                             type: number
 *                           status:
 *                             type: string
 *                           sellerEmail:
 *                             type: string
 *                             nullable: true
 *                           shipment:
 *                             type: object
 *                             properties:
 *                               trackingNumber:
 *                                 type: string
 *                                 nullable: true
 *                               courier:
 *                                 type: string
 *                                 nullable: true
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Detail komplain berhasil diambil"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     type:
 *                       type: string
 *                     buyer_reason:
 *                       type: string
 *                     buyer_evidence_urls:
 *                       type: array
 *                       items:
 *                         type: string
 *                     seller_response_reason:
 *                       type: string
 *                       nullable: true
 *                     seller_evidence_urls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       nullable: true
 *                     seller_decision:
 *                       type: string
 *                       nullable: true
 *                     seller_responded_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     admin_decision:
 *                       type: string
 *                       nullable: true
 *                     admin_responded_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     buyer_deadline_input_shipment:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     seller_confirm_deadline:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     request_confirmation_status:
 *                       type: string
 *                       nullable: true
 *                     admin_approved_confirmation_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     admin_rejected_confirmation_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     seller_confirmed_return_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     buyer_requested_confirmation_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     buyer_requested_confirmation_reason:
 *                       type: string
 *                       nullable: true
 *                     buyer_requested_confirmation_evidence_urls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       nullable: true
 *                     resolved_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     canceled_by_buyer_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                           message:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           reason:
 *                             type: string
 *                             nullable: true
 *                           evidence:
 *                             type: array
 *                             items:
 *                               type: string
 *                             nullable: true
 *                           decision:
 *                             type: string
 *                             nullable: true
 *                           trackingNumber:
 *                             type: string
 *                             nullable: true
 *                           courier:
 *                             type: string
 *                             nullable: true
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         transactionCode:
 *                           type: string
 *                         itemName:
 *                           type: string
 *                         totalAmount:
 *                           type: number
 *                         itemPrice:
 *                           type: number
 *                         platformFee:
 *                           type: number
 *                         insuranceFee:
 *                           type: number
 *                         virtualAccount:
 *                           type: string
 *                         status:
 *                           type: string
 *                         sellerEmail:
 *                           type: string
 *                           nullable: true
 *                         shipment:
 *                           type: object
 *                           properties:
 *                             trackingNumber:
 *                               type: string
 *                               nullable: true
 *                             courier:
 *                               type: string
 *                               nullable: true
 *                     returnShipment:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         trackingNumber:
 *                           type: string
 *                           nullable: true
 *                         courierName:
 *                           type: string
 *                           nullable: true
 *                         shipmentDate:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         photoUrl:
 *                           type: string
 *                           nullable: true
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
