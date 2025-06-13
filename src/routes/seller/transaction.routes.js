import { Router } from "express";
import sellerTransactionController from "../../controllers/seller/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

const router = Router();

router.get(
  "/transactions/:transactionId", 
  authentication,
  authentication,
  asyncHandler(sellerTransactionController.getTransactionDetailSeller)
);

router.post(
  "/transactions/:transactionId/shipping",
  authentication,
  asyncHandler(sellerTransactionController.inputShipment)
);

router.post(
  "/transactions/:transactionId/cancel",
  authentication,
  asyncHandler(sellerTransactionController.cancelTransactionBySeller)
);

router.post(
  "/transaction/:transactionId/request-confirmation-shipment",
  authentication,
  uploadImage("evidance"),
  asyncHandler(sellerTransactionController.confirmationShipmentRequest)
);
router.get(
  "/transactions/:transactionId",
  asyncHandler(sellerTransactionController.getTransactionDetailSeller)
);

router.get(
  "/transactions",
  authentication,
  asyncHandler(transactionController.getTransactionListSeller)
);

router.post(
  "/transactions",
  authentication,
  transactionValidator.createTransactionValidation,
  validateRequest,
  asyncHandler(transactionController.generateTransaction)
);

export default router;

/**
 * @swagger
 * tags:
 *   name: Seller Transactions
 *   description: Endpoints terkait transaksi seller
 */

/**
 * @swagger
 * /api/seller/transactions/{transactionId}:
 *   get:
 *     summary: Mendapatkan detail transaksi seller
 *     tags: [Seller Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         required: true
 *         description: ID transaksi
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail transaksi berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 transactionCode:
 *                   type: string
 *                 status:
 *                   type: string
 *                 itemName:
 *                   type: string
 *                 itemPrice:
 *                   type: number
 *                 insuranceFee:
 *                   type: number
 *                 platformFee:
 *                   type: number
 *                 totalAmount:
 *                   type: number
 *                 virtualAccount:
 *                   type: string
 *                 buyerEmail:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 paidAt:
 *                   type: string
 *                   format: date-time
 *                 paymentDeadline:
 *                   type: string
 *                   format: date-time
 *                 shipmentDeadline:
 *                   type: string
 *                   format: date-time
 *                 shipment:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     trackingNumber:
 *                       type: string
 *                     courier:
 *                       type: string
 *                     shipmentDate:
 *                       type: string
 *                       format: date-time
 *                     photoUrl:
 *                       type: string
 *                 fundReleaseRequest:
 *                   type: object
 *                   properties:
 *                     requested:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                     requestedAt:
 *                       type: string
 *                       format: date-time
 *                     resolvedAt:
 *                       type: string
 *                       format: date-time
 *
 *                 rekeningSeller:
 *                   type: object
 *                   properties:
 *                     bankName:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *                     logoUrl:
 *                       type: string
 *                 buyerConfirmedAt:
 *                   type: string
 *                   format: date-time
 *                 buyerConfirmDeadline:
 *                   type: string
 *                   format: date-time
 *                 currentTimestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Transaksi tidak ditemukan atau bukan milik Anda
 */

/**
 * @swagger
 * /api/seller/transactions/{transactionId}/shipping:
 *   post:
 *     summary: Input resi pengiriman untuk transaksi seller
 *     tags: [Seller Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         required: true
 *         description: ID transaksi
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courierId
 *               - trackingNumber
 *               - photoUrl
 *             properties:
 *               courierId:
 *                 type: string
 *               trackingNumber:
 *                 type: string
 *               photoUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resi berhasil disimpan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Transaksi tidak ditemukan
 *       400:
 *         description: Transaksi belum bisa dikirim
 */

/**
 * @swagger
 * /api/seller/transactions/{transactionId}/cancel:
 *   post:
 *     summary: Membatalkan transaksi seller
 *     tags: [Seller Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         required: true
 *         description: ID transaksi
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaksi berhasil dibatalkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Transaksi tidak ditemukan
 *       400:
 *         description: Transaksi tidak dapat dibatalkan
 */
