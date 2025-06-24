import { Router } from "express";
import complaintController from "../../controllers/admin/complaint.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(complaintController.getAllComplaintList));
router.get("/:id", asyncHandler(complaintController.getComplaintById));
router.post(
  "/:id/:action",
  asyncHandler(complaintController.responseComplaint)
);

export default router;

/**
 * @swagger
 * tags:
 *   name: AdminComplaint
 *   description: Endpoints untuk manajemen pengaduan oleh admin
 */

/**
 * @swagger
 * /api/admin/complaints:
 *   get:
 *     summary: Mendapatkan daftar pengaduan
 *     tags: [AdminComplaint]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [damaged, lost, not_as_described]
 *         description: Filter berdasarkan tipe pengaduan
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [waiting_seller_approval, return_requested, return_in_transit, awaiting_seller_confirmation, completed, under_investigation, approved_by_seller, approved_by_admin, rejected_by_seller, rejected_by_admin, canceled_by_buyer]
 *         description: Filter berdasarkan status pengaduan
 *     responses:
 *       200:
 *         description: Daftar pengaduan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
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
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       buyer:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                       transaction:
 *                         type: object
 *                         properties:
 *                           transaction_code:
 *                             type: string
 *                           item_name:
 *                             type: string
 *                           insurance_fee:
 *                             type: number
 *                           shipment:
 *                             type: object
 *                             properties:
 *                               tracking_number:
 *                                 type: string
 *                               courier:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *       404:
 *         description: Tidak ada daftar pengaduan yang ditemukan
 */

/**
 * @swagger
 * /api/admin/complaints/{id}:
 *   get:
 *     summary: Mendapatkan detail pengaduan berdasarkan ID
 *     tags: [AdminComplaint]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengaduan
 *     responses:
 *       200:
 *         description: Pengaduan berhasil diambil
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
 *                   example: Pengaduan berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     transaction_id:
 *                       type: string
 *                     buyer_id:
 *                       type: string
 *                     type:
 *                       type: string
 *                     status:
 *                       type: string
 *                     buyer_reason:
 *                       type: string
 *                     buyer_evidence_urls:
 *                       type: array
 *                       items:
 *                         type: string
 *                     seller_response_reason:
 *                       type: string
 *                     seller_evidence_urls:
 *                       type: array
 *                       items:
 *                         type: string
 *                     buyer_requested_confirmation_at:
 *                       type: string
 *                       format: date-time
 *                     buyer_requested_confirmation_reason:
 *                       type: string
 *                     buyer_requested_confirmation_evidence_urls:
 *                       type: array
 *                       items:
 *                         type: string
 *                     request_confirmation_status:
 *                       type: string
 *                     request_confirmation_admin_id:
 *                       type: string
 *                       nullable: true
 *                     seller_confirm_deadline:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     resolved_at:
 *                       type: string
 *                       format: date-time
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         transaction_code:
 *                           type: string
 *                         seller_id:
 *                           type: string
 *                         buyer_id:
 *                           type: string
 *                         item_name:
 *                           type: string
 *                         item_price:
 *                           type: number
 *                         platform_fee:
 *                           type: number
 *                         insurance_fee:
 *                           type: number
 *                         total_amount:
 *                           type: number
 *                         status:
 *                           type: string
 *                         virtual_account_number:
 *                           type: string
 *                         paid_at:
 *                           type: string
 *                           format: date-time
 *                         payment_deadline:
 *                           type: string
 *                           format: date-time
 *                         shipment_deadline:
 *                           type: string
 *                           format: date-time
 *                         buyer_confirm_deadline:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         confirmed_at:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         withdrawal_bank_account_id:
 *                           type: string
 *                         withdrawn_at:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         withdrawn_amount:
 *                           type: number
 *                           nullable: true
 *                         cancelled_at:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         cancelled_by_id:
 *                           type: string
 *                           nullable: true
 *                         cancel_reason:
 *                           type: string
 *                           nullable: true
 *                         refunded_at:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         refund_amount:
 *                           type: number
 *                           nullable: true
 *                         refund_reason:
 *                           type: string
 *                           nullable: true
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                         shipment:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             transaction_id:
 *                               type: string
 *                             courier_id:
 *                               type: string
 *                             tracking_number:
 *                               type: string
 *                             shipment_date:
 *                               type: string
 *                               format: date-time
 *                             received_date:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *                             photo_url:
 *                               type: string
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                     return_shipment:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         complaint_id:
 *                           type: string
 *                         courier_id:
 *                           type: string
 *                         tracking_number:
 *                           type: string
 *                         shipment_date:
 *                           type: string
 *                           format: date-time
 *                         received_date:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         photo_url:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Pengaduan tidak ditemukan
 */

/**
 * @swagger
 * /api/admin/complaints/{id}/{action}:
 *   post:
 *     summary: Admin merespon pengaduan (approve/reject)
 *     tags: [AdminComplaint]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pengaduan
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [approve, reject]
 *         description: Aksi admin terhadap pengaduan (approve atau reject)
 *     responses:
 *       200:
 *         description: Pengaduan berhasil direspon oleh admin
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Pengaduan berhasil disetujui oleh admin
 *       400:
 *         description: Parameter action tidak valid atau pengaduan tidak dalam status yang dapat direspon
 *         content:
 *           application/json:
 *             examples:
 *               invalidAction:
 *                 summary: Action tidak valid
 *                 value:
 *                   success: false
 *                   message: Parameter action tidak valid
 *               invalidStatus:
 *                 summary: Status pengaduan tidak valid
 *                 value:
 *                   success: false
 *                   message: Pengaduan tidak dalam status yang dapat direspon
 *       404:
 *         description: Pengaduan tidak ditemukan
 */
