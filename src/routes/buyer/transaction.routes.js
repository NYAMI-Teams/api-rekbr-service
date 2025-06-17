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
 *     summary: Retrieve a list of buyer transactions
 *     tags: [BuyerTransaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: isHistory
 *         in: query
 *         required: false
 *         description: Filter transactions by history (true for completed/canceled transactions, false for active transactions)
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of buyer transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the transaction
 *                   transactionCode:
 *                     type: string
 *                     description: Code representing the transaction
 *                   itemName:
 *                     type: string
 *                     description: Name of the item in the transaction
 *                   totalAmount:
 *                     type: number
 *                     description: Total amount for the transaction
 *                   sellerEmail:
 *                     type: string
 *                     description: Email of the seller
 *                   virtualAccount:
 *                     type: string
 *                     description: Virtual account number for payment
 *                   status:
 *                     type: string
 *                     description: Current status of the transaction
 *                   paymentDeadline:
 *                     type: string
 *                     format: date-time
 *                     description: Deadline for payment
 *                   shipmentDeadline:
 *                     type: string
 *                     format: date-time
 *                     description: Deadline for shipment
 *                   currentTimestamp:
 *                     type: string
 *                     format: date-time
 *                     description: Current timestamp
 *                   shipment:
 *                     type: object
 *                     nullable: true
 *                     description: Shipment details
 *                     properties:
 *                       trackingNumber:
 *                         type: string
 *                         nullable: true
 *                         description: Tracking number for shipment
 *                       courier:
 *                         type: string
 *                         nullable: true
 *                         description: Courier name
 *                       shipmentDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         description: Shipment date
 *                   fundReleaseRequest:
 *                     type: object
 *                     description: Details of the fund release request
 *                     properties:
 *                       requested:
 *                         type: boolean
 *                         description: Indicates if a fund release request was made
 *                       status:
 *                         type: string
 *                         description: Status of the fund release request
 *                       requestedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when the fund release request was made
 *                       resolvedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         description: Timestamp when the fund release request was resolved
 *                       adminEmail:
 *                         type: string
 *                         nullable: true
 *                         description: Email of the admin who resolved the request
 *                   buyerConfirmDeadline:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     description: Deadline for buyer confirmation
 *                   buyerConfirmedAt:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     description: Timestamp when the buyer confirmed receipt
 *       404:
 *         description: No transactions found for the buyer
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
