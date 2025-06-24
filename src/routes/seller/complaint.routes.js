import { Router } from "express";
import complaintController from "../../controllers/seller/complaint.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import transactionValidator from "../../validators/seller.validator.js";
import validateRequest from "../../middlewares/validateRequest.js";
import authentication from "../../middlewares/authentication.js";
import uploadImage from "../../middlewares/uploadImage.js";
import shipmentValidator from "../../validators/shipment.validator.js";
const router = Router();

router.patch(
  "/complaints/:complaintId/respond",
  authentication,
  uploadImage.array("photo", 5, 10),
  asyncHandler(complaintController.patchSellerResponse)
);

router.patch(
  "/complaints/:complaintId/confirm-return",
  authentication,
  asyncHandler(complaintController.patchSellerItemReceive)
);

router.get(
  "/complaints",
  authentication,
  asyncHandler(complaintController.getComplaintListBySeller)
);

router.get(
  "/complaints/:complaintId",
  authentication,
  asyncHandler(complaintController.getComplaintDetailBySeller)
);

export default router;

/**
 * @swagger
 * tags:
 *   name: SellerComplaint
 *   description: Endpoints terkait komplain seller
 */

/**
 * @swagger
 * /api/seller/complaints/{complaintId}/respond:
 *   patch:
 *     summary: Mengupdate respons komplain oleh seller
 *     tags: [SellerComplaint]
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
 *               - status
 *               - seller_response_reason
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [return_requested, rejected_by_seller]
 *                 description: Status respons komplain
 *               seller_response_reason:
 *                 type: string
 *                 description: Alasan respons seller
 *               photo:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array foto bukti (opsional)
 *     responses:
 *       200:
 *         description: Respons komplain berhasil diperbarui
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
 *                   example: "Berhasil memperbarui respons penjual"
 *                 data:
 *                   type: object
 *                   description: Detail komplain yang diperbarui
 *       400:
 *         description: Permintaan tidak valid atau melanggar aturan bisnis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Komplain sedang dalam progress"
 *       404:
 *         description: Komplain tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Komplain tidak ditemukan"
 *       500:
 *         description: Terjadi kesalahan pada server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Gagal memperbarui respons penjual"
 */

/**
 * @swagger
 * /api/seller/complaints/{complaintId}/confirm-return:
 *   patch:
 *     summary: Konfirmasi penerimaan barang yang dikembalikan
 *     tags: [SellerComplaint]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [completed]
 *                 description: Status penerimaan barang
 *     responses:
 *       200:
 *         description: Status penerimaan barang berhasil diperbarui
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
 *                   example: "Berhasil memperbarui status penerimaan barang"
 *                 data:
 *                   type: object
 *                   description: Detail komplain yang diperbarui
 *       400:
 *         description: Permintaan tidak valid atau melanggar aturan bisnis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Status complaint tidak sesuai"
 *       404:
 *         description: Komplain tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Komplain tidak ditemukan"
 *       500:
 *         description: Terjadi kesalahan pada server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Gagal memperbarui status penerimaan barang"
 */

/**
 * @swagger
 * /api/seller/complaints:
 *   get:
 *     summary: Mendapatkan daftar komplain milik seller
 *     tags: [SellerComplaint]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset untuk paginasi
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit jumlah data
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
 *                           buyerEmail:
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
 *       401:
 *         description: Tidak terautentikasi
 *       500:
 *         description: Terjadi kesalahan pada server
 */

/**
 * @swagger
 * /api/seller/complaints/{complaintId}:
 *   get:
 *     summary: Mendapatkan detail komplain milik seller
 *     tags: [SellerComplaint]
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
 *                       nullable: true
 *                     buyer_evidence_urls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       nullable: true
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
 *                     admin_decision:
 *                       type: string
 *                       nullable: true
 *                     buyer_deadline_input_shipment:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     canceled_by_buyer_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         transactionCode:
 *                           type: string
 *                         itemName:
 *                           type: string
 *                         totalAmount:
 *                           type: number
 *                         virtualAccount:
 *                           type: string
 *                         status:
 *                           type: string
 *                         buyerEmail:
 *                           type: string
 *                           nullable: true
 *                         courier:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               nullable: true
 *                         trackingNumber:
 *                           type: string
 *                           nullable: true
 *       401:
 *         description: Tidak terautentikasi
 *       404:
 *         description: Komplain tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
 */
