import { Router } from "express";
import adminUserController from "../../controllers/admin/user.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authentication from "../../middlewares/authentication.js";
import authorization from "../../middlewares/authorization.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AdminUser
 *   description: Endpoints for admin user management
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Retrieve all users for admin
 *     tags: [AdminUser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by email
 *       - in: query
 *         name: kycStatus
 *         schema:
 *           type: string
 *         description: Filter users by KYC status
 *       - in: query
 *         name: createdFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter users created from this date
 *       - in: query
 *         name: createdTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter users created up to this date
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
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       status:
 *                         type: string
 *                       kycStatus:
 *                         type: string
 *                       isAdmin:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 totalCount:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       404:
 *         description: No users found
 */

router.get(
  "/",
  authentication,
  authorization,
  asyncHandler(adminUserController.getAllUsers)
);

export default router;
