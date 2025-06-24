import { Router } from "express";
import adminTransactionController from "../../controllers/admin/transaction.controller.js";
import adminUserController from "../../controllers/admin/user.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authentication from "../../middlewares/authentication.js";
import authorization from "../../middlewares/authorization.js";

const router = Router();

router.get(
  "/",
  authentication,
  authorization,
  asyncHandler(adminTransactionController.getAllTransactions)
);

router.get(
  "/:transactionId",
  authentication,
  authorization,
  asyncHandler(adminTransactionController.getTransactionDetailById)
);

router.post(
  "/:transactionId/fund-release/:action",
  authentication,
  authorization,
  asyncHandler(adminTransactionController.updateFundReleaseRequestStatus)
);

export default router;

/**
 * @swagger
 * tags:
 *   name: AdminTransaction
 *   description: Endpoints for admin transaction management
 */

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Retrieve all transactions for admin
 *     tags: [AdminTransaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter transactions by status
 *       - in: query
 *         name: fundReleaseStatus
 *         schema:
 *           type: string
 *         description: Filter transactions by fund release status
 *       - in: query
 *         name: createdFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter transactions created from this date
 *       - in: query
 *         name: createdTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter transactions created up to this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search transactions by transaction code, item name, or email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Pagination page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       transactionCode:
 *                         type: string
 *                       itemName:
 *                         type: string
 *                       itemPrice:
 *                         type: number
 *                       totalAmount:
 *                         type: number
 *                       buyerEmail:
 *                         type: string
 *                       sellerEmail:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       fundReleaseStatus:
 *                         type: string
 *                 totalCount:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       404:
 *         description: No transactions found
 */

/**
 * @swagger
 * /api/admin/transactions/{transactionId}:
 *   get:
 *     summary: Retrieve transaction details by ID
 *     tags: [AdminTransaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the transaction
 *     responses:
 *       200:
 *         description: Successfully retrieved transaction details
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
 *                 withdrawalBank:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     bankName:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *                     logoUrl:
 *                       type: string
 *                 fundReleaseRequest:
 *                   type: object
 *                   properties:
 *                     requested:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                       nullable: true
 *                     evidenceUrl:
 *                       type: string
 *                       nullable: true
 *                     requestedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     resolvedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     adminEmail:
 *                       type: string
 *                       nullable: true
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
 *         description: Transaction not found
 */

/**
 * @swagger
 * /api/admin/transactions/{transactionId}/fund-release/{action}:
 *   post:
 *     summary: Update fund release request status
 *     tags: [AdminTransaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the transaction
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [approve, reject]
 *         description: Action to perform on the fund release request
 *     responses:
 *       200:
 *         description: Successfully updated fund release request status
 *       400:
 *         description: Invalid action or request status
 *       404:
 *         description: Fund release request not found
 */
