import { Router } from "express";
import buyerTransactionController from "../../controllers/buyer/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authentication from "../../middlewares/authentication.js";

const router = Router();

router.get(
  "/transactions/:transactionId",
  authentication,
  asyncHandler(buyerTransactionController.getTransactionDetailBuyer)
);

router.post(
  "/transactions/:transactionId/simulate-payment",
  authentication,
  asyncHandler(buyerTransactionController.simulatePayment)
);

router.post(
  "/transactions/:transactionId/confirm-received",
  authentication,
  asyncHandler(buyerTransactionController.confirmReceived)
);

router.get(
  "/transactions",
  authentication,
  asyncHandler(buyerTransactionController.getTransactionListBuyer)
);

export default router;

/**
 * @swagger
 * tags:
 *   name: BuyerTransaction
 *   description: Endpoints terkait transaksi buyer
 */

/**
 * @swagger
 * /api/buyer/transactions/{transactionId}:
 *   get:
 *     summary: Mendapatkan detail transaksi buyer
 *     tags: [BuyerTransaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi
 *     responses:
 *       200:
 *         description: Detail transaksi buyer berhasil diambil
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
 *                 sellerEmail:
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
 *                 buyerConfirmDeadline:
 *                   type: string
 *                   format: date-time
 *                 buyerConfirmedAt:
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
 * /api/buyer/transactions:
 *   get:
 *     summary: Mendapatkan daftar transaksi buyer
 *     tags: [BuyerTransaction]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List transaksi buyer berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   transactionCode:
 *                     type: string
 *                   itemName:
 *                     type: string
 *                   totalAmount:
 *                     type: number
 *                   buyerEmail:
 *                     type: string
 *                   virtualAccount:
 *                     type: string
 *                   status:
 *                     type: string
 *                   paymentDeadline:
 *                     type: string
 *                     format: date-time
 *                   shipmentDeadline:
 *                     type: string
 *                     format: date-time
 *                   currentTimestamp:
 *                     type: string
 *                     format: date-time
 *                   trackingNumber:
 *                     type: string
 *                     nullable: true
 *                   fundReleaseRequest:
 *                     type: object
 *                     properties:
 *                       requested:
 *                         type: boolean
 *                       status:
 *                         type: string
 *                       requestedAt:
 *                         type: string
 *                         format: date-time
 *                       resolvedAt:
 *                         type: string
 *                         format: date-time
 *                       adminEmail:
 *                         type: string
 *                         nullable: true
 *       404:
 *         description: Transaksi tidak ditemukan
 */

/**
 * @swagger
 * /api/buyer/transactions/{transactionId}/simulate-payment:
 *   post:
 *     summary: Simulasi pembayaran transaksi
 *     tags: [BuyerTransaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi
 *     responses:
 *       200:
 *         description: Pembayaran simulasi berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactionCode:
 *                   type: string
 *                 status:
 *                   type: string
 *                 paidAt:
 *                   type: string
 *                   format: date-time
 *                 shipmentDeadline:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Transaksi tidak ditemukan atau bukan milik Anda
 */

/**
 * @swagger
 * /api/buyer/transactions/{transactionId}/confirm-received:
 *   post:
 *     summary: Konfirmasi barang diterima
 *     tags: [BuyerTransaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID transaksi
 *     responses:
 *       200:
 *         description: Barang berhasil dikonfirmasi diterima
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 confirmedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Transaksi tidak ditemukan atau belum dikirim
 */
