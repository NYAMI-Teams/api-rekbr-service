import { Router } from "express";
import complaintController from "../../controllers/seller/complaint.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import transactionValidator from "../../validators/seller.validator.js";
import validateRequest from "../../middlewares/validateRequest.js";
import authentication from "../../middlewares/authentication.js";
import uploadImage from "../../middlewares/uploadImage.js";
import shipmentValidator from "../../validators/shipment.validator.js";
import multer from "multer";
const router = Router();

const upload = multer();

router.patch(
  "/complaints/:complaintId/respond",
  authentication,
  upload.array("photo"),
  asyncHandler(complaintController.patchSellerResponse)
);

router.patch(
  "/complaints/:complaintId/confirm-return",
  authentication,
  asyncHandler(complaintController.patchSellerItemReceive)
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
