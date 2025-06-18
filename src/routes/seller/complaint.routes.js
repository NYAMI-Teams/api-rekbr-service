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
    "/complaints/:transactionId/respond",
    authentication,
    upload.array("photo"),  
    asyncHandler(complaintController.patchSellerResponse)
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
 * /complaints/{transactionId}/respond:
 *   patch:
 *     summary: Mengupdate respons komplain oleh seller
 *     tags: [SellerComplaint]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi terkait komplain
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
 *                   example: "Komplain sudah termin harap membuat complaint baru"
 *       404:
 *         description: Transaksi tidak ditemukan
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
 *                   example: "Transaksi tidak ditemukan"
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