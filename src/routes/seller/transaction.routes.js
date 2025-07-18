import { Router } from "express";
import sellerTransactionController from "../../controllers/seller/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import transactionValidator from "../../validators/seller.validator.js";
import validateRequest from "../../middlewares/validateRequest.js";
import authentication from "../../middlewares/authentication.js";
import uploadImage from "../../middlewares/uploadImage.js";
import shipmentValidator from "../../validators/shipment.validator.js";
const router = Router();

router.get(
  "/transactions/:transactionId",
  authentication,
  asyncHandler(sellerTransactionController.getTransactionDetailSeller)
);

router.post(
  "/transactions/:transactionId/shipping",
  authentication,
  uploadImage.single("photo", 2),
  shipmentValidator.inputShipmentValidator,
  validateRequest,
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
  uploadImage.single("evidence", 2),
  asyncHandler(sellerTransactionController.confirmationShipmentRequest)
);

router.get(
  "/transactions",
  authentication,
  asyncHandler(sellerTransactionController.getTransactionListSeller)
);

router.post(
  "/transactions",
  authentication,
  transactionValidator.createTransactionValidation,
  validateRequest,
  asyncHandler(sellerTransactionController.generateTransaction)
);

router.get(
  "/courier-list",
  authentication,
  asyncHandler(sellerTransactionController.getCourierList)
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
 *               $ref: '#/components/schemas/TransactionDetail'
 *       404:
 *         description: Transaksi tidak ditemukan atau bukan milik Anda
 */

/**
 * @swagger
 * /api/seller/transactions:
 *   get:
 *     summary: Mendapatkan daftar transaksi seller
 *     tags: [Seller Transactions]
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
 *         description: "Offset untuk pagination (default: 0)"
 *         schema:
 *           type: integer
 *           example: 0
 *       - name: limit
 *         in: query
 *         required: false
 *         description: "Jumlah data per halaman (default: 100)"
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: List transaksi seller berhasil diambil
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
 * /api/seller/transactions:
 *   post:
 *     summary: Membuat transaksi baru oleh seller
 *     tags: [Seller Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionDetail'
 *       400:
 *         description: Validasi gagal atau transaksi aktif sudah ada
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
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/InputShipmentRequest'
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
 *                   example: true
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

/**
 * @swagger
 * /api/seller/transaction/{transactionId}/request-confirmation-shipment:
 *   post:
 *     summary: Permintaan konfirmasi pengiriman untuk transaksi seller
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
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmationShipmentRequest'
 *     responses:
 *       200:
 *         description: Permintaan konfirmasi pengiriman berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Transaksi tidak ditemukan atau bukan milik Anda
 *       400:
 *         description: Gagal meminta konfirmasi
 */

/**
 * @swagger
 * /api/seller/courier-list:
 *   get:
 *     summary: Mendapatkan daftar kurir
 *     tags: [Seller Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List kurir berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Courier'
 *       404:
 *         description: Daftar kurir tidak ditemukan
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
 *         buyerEmail:
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
 *         rekeningSeller:
 *           type: object
 *           properties:
 *             bankName:
 *               type: string
 *             accountNumber:
 *               type: string
 *             logoUrl:
 *               type: string
 *         Complaint:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Complaint'
 *           nullable: true
 *         buyerConfirmedAt:
 *           type: string
 *           format: date-time
 *         buyerConfirmDeadline:
 *           type: string
 *           format: date-time
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
 *         buyerEmail:
 *           type: string
 *         virtualAccount:
 *           type: string
 *         status:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
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
 *           nullable: true
 *         buyerConfirmedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     CreateTransactionRequest:
 *       type: object
 *       required:
 *         - email
 *         - item_name
 *         - item_price
 *         - withdrawal_bank_account_id
 *         - isInsurance
 *       properties:
 *         email:
 *           type: string
 *           description: Email pembeli
 *         item_name:
 *           type: string
 *           description: Nama item yang dijual
 *         item_price:
 *           type: number
 *           description: Harga item yang dijual
 *         withdrawal_bank_account_id:
 *           type: string
 *           description: ID rekening penarikan
 *         isInsurance:
 *           type: boolean
 *           description: Apakah transaksi menggunakan asuransi (true atau false)
 *     InputShipmentRequest:
 *       type: object
 *       required:
 *         - courier_id
 *         - tracking_number
 *         - photo
 *       properties:
 *         courier_id:
 *           type: string
 *           description: ID kurir pengiriman
 *         tracking_number:
 *           type: string
 *           description: Nomor resi pengiriman
 *         photo:
 *           type: string
 *           format: binary
 *           description: Foto bukti pengiriman
 *     ConfirmationShipmentRequest:
 *       type: object
 *       required:
 *         - evidence
 *         - reason
 *       properties:
 *         evidence:
 *           type: string
 *           format: binary
 *           description: Bukti pengiriman
 *         reason:
 *           type: string
 *           description: Alasan permintaan konfirmasi
 *     Courier:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID kurir
 *         name:
 *           type: string
 *           description: Nama kurir
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
 *         sellerResponseReason:
 *           type: string
 *           nullable: true
 *         sellerEvidenceUrls:
 *           type: array
 *           items:
 *             type: string
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
 *           $ref: '#/components/schemas/ReturnShipment'
 *           nullable: true
 *         returnShipmentTrackingNumber:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ReturnShipment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         trackingNumber:
 *           type: string
 *         courierName:
 *           type: string
 *           nullable: true
 *         shipmentDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         receivedDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 */
