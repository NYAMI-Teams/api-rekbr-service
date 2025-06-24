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
 *               $ref: '#/components/schemas/TransactionDetail'
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
 *     parameters:
 *       - name: status
 *         in: query
 *         required: false
 *         description: Filter transaksi berdasarkan status (aktif, selesai, dibatalkan, dll.)
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["pending_payment", "waiting_shipment"]
 *       - name: offset
 *         in: query
 *         required: false
 *         description: Offset untuk paginasi (default 0)
 *         schema:
 *           type: integer
 *           example: 0
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Jumlah data per halaman (default 10)
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: List transaksi buyer berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TransactionListItem'
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

/**
 * @swagger
 * components:
 *   schemas:
 *     TransactionDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         transactionCode:
 *           type: string
 *         status:
 *           type: string
 *         itemName:
 *           type: string
 *         itemPrice:
 *           type: number
 *         insuranceFee:
 *           type: number
 *         platformFee:
 *           type: number
 *         totalAmount:
 *           type: number
 *         virtualAccount:
 *           type: string
 *         sellerEmail:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         paidAt:
 *           type: string
 *           format: date-time
 *         paymentDeadline:
 *           type: string
 *           format: date-time
 *         shipmentDeadline:
 *           type: string
 *           format: date-time
 *         shipment:
 *           type: object
 *           nullable: true
 *           properties:
 *             trackingNumber:
 *               type: string
 *             courier:
 *               type: string
 *             shipmentDate:
 *               type: string
 *               format: date-time
 *             photoUrl:
 *               type: string
 *         fundReleaseRequest:
 *           type: object
 *           properties:
 *             requested:
 *               type: boolean
 *             status:
 *               type: string
 *             requestedAt:
 *               type: string
 *               format: date-time
 *             resolvedAt:
 *               type: string
 *               format: date-time
 *             adminEmail:
 *               type: string
 *         buyerConfirmDeadline:
 *           type: string
 *           format: date-time
 *         buyerConfirmedAt:
 *           type: string
 *           format: date-time
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         cancelledBy:
 *           type: string
 *           nullable: true
 *         cancelledReason:
 *           type: string
 *           nullable: true
 *         complaint:
 *           type: array
 *           nullable: true
 *           items:
 *             $ref: '#/components/schemas/Complaint'
 *         currentTimestamp:
 *           type: string
 *           format: date-time
 *     TransactionListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         transactionCode:
 *           type: string
 *         itemName:
 *           type: string
 *         totalAmount:
 *           type: number
 *         sellerEmail:
 *           type: string
 *         virtualAccount:
 *           type: string
 *         status:
 *           type: string
 *         paymentDeadline:
 *           type: string
 *           format: date-time
 *         shipmentDeadline:
 *           type: string
 *           format: date-time
 *         currentTimestamp:
 *           type: string
 *           format: date-time
 *         shipment:
 *           type: object
 *           nullable: true
 *           properties:
 *             trackingNumber:
 *               type: string
 *             courier:
 *               type: string
 *             shipmentDate:
 *               type: string
 *               format: date-time
 *             photoUrl:
 *               type: string
 *         fundReleaseRequest:
 *           type: object
 *           properties:
 *             requested:
 *               type: boolean
 *             status:
 *               type: string
 *             requestedAt:
 *               type: string
 *               format: date-time
 *             resolvedAt:
 *               type: string
 *               format: date-time
 *             adminEmail:
 *               type: string
 *         complaint:
 *           $ref: '#/components/schemas/Complaint'
 *           nullable: true
 *         buyerConfirmDeadline:
 *           type: string
 *           format: date-time
 *         buyerConfirmedAt:
 *           type: string
 *           format: date-time
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         cancelledBy:
 *           type: string
 *           nullable: true
 *         cancelledReason:
 *           type: string
 *           nullable: true
 *
 *     Complaint:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         transactionId:
 *           type: string
 *         buyerId:
 *           type: string
 *         type:
 *           type: string
 *         status:
 *           type: string
 *         buyerReason:
 *           type: string
 *           nullable: true
 *         buyerEvidenceUrls:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *         sellerResponseReason:
 *           type: string
 *           nullable: true
 *         sellerEvidenceUrls:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *         buyerRequestedConfirmationAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         buyerRequestedConfirmationReason:
 *           type: string
 *           nullable: true
 *         buyerRequestedConfirmationEvidenceUrls:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *         requestConfirmationStatus:
 *           type: string
 *           nullable: true
 *         requestConfirmationAdminId:
 *           type: string
 *           nullable: true
 *         sellerConfirmDeadline:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         returnShipment:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *             trackingNumber:
 *               type: string
 *             courierName:
 *               type: string
 *               nullable: true
 *             shipmentDate:
 *               type: string
 *               format: date-time
 *               nullable: true
 *             receivedDate:
 *               type: string
 *               format: date-time
 *               nullable: true
 *         returnShipmentTrackingNumber:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
