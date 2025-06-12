import { Router } from "express";
import sellerTransactionController from "../../controllers/seller/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authentication from "../../middlewares/authentication.js";

const router = Router();

router.get(
  "/transactions/:transactionId",
  authentication,
  asyncHandler(sellerTransactionController.getTransactionDetailSeller)
);

router.post(
  "/transactions/:transactionId/shipment",
  authentication,
  asyncHandler(sellerTransactionController.inputShipment)
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
 *                 buyerConfirmedAt:
 *                   type: string
 *                   format: date-time
 *                 rekeningSeller:
 *                   type: object
 *                   properties:
 *                     bankName:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *                     logoUrl:
 *                       type: string
 *                 currentTimestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Transaksi tidak ditemukan
 */

/**
 * @swagger
 * /api/seller/transactions/{transactionId}/shipment:
 *   post:
 *     summary: Input resi pengiriman untuk transaksi seller
 *     tags: [Seller Transactions]
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
