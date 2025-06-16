import { Router } from "express";
import bankController from "../controllers/bank.controller.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import accountValidator from "../validators/bank.validator.js";
import validateRequest from "../middlewares/validateRequest.js";
import authentication from "../middlewares/authentication.js";
const router = Router();

router.get("/bank-list", authentication, asyncHandler(bankController.getBanks));

router.get("/account", authentication, asyncHandler(bankController.getDummyAccount));

router.get("/account-list", authentication, asyncHandler(bankController.getAccounts));

router.post("/account", authentication, accountValidator.createAccountValidation, validateRequest, asyncHandler(bankController.postAccount));

export default router;
/**
 * @swagger
 * tags:
 *   name: Bank
 *   description: Endpoints related to bank operations
 */

/**
 * @swagger
 * /api/bank/bank-list:
 *   get:
 *     summary: Retrieve the list of banks
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of banks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the bank
 *                   bankName:
 *                     type: string
 *                     description: Name of the bank
 *                   logoUrl:
 *                     type: string
 *                     description: URL of the bank's logo
 *       400:
 *         description: No banks found
 */

/**
 * @swagger
 * /api/bank/account:
 *   get:
 *     summary: Retrieve a dummy account
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: account_number
 *         in: query
 *         required: true
 *         description: Account number of the dummy account
 *         schema:
 *           type: string
 *       - name: bank_id
 *         in: query
 *         required: true
 *         description: ID of the bank
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the dummy account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the dummy account
 *                 accountNumber:
 *                   type: string
 *                   description: Account number
 *                 bankId:
 *                   type: string
 *                   description: ID of the bank
 *       404:
 *         description: No dummy account found
 */

/**
 * @swagger
 * /api/bank/account-list:
 *   get:
 *     summary: Retrieve the list of accounts for the authenticated user
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the account
 *                   accountNumber:
 *                     type: string
 *                     description: Account number
 *                   accountHolderName:
 *                     type: string
 *                     description: Name of the account holder
 *                   bank:
 *                     type: object
 *                     properties:
 *                       bankName:
 *                         type: string
 *                         description: Name of the bank
 *                       logoUrl:
 *                         type: string
 *                         description: URL of the bank's logo
 *       404:
 *         description: No accounts found
 */

/**
 * @swagger
 * /api/bank/account:
 *   post:
 *     summary: Create a new bank account
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bank_id:
 *                 type: string
 *                 description: ID of the bank
 *               account_number:
 *                 type: string
 *                 description: Account number
 *               account_holder_name:
 *                 type: string
 *                 description: Name of the account holder
 *     responses:
 *       201:
 *         description: Successfully created the account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the account
 *                 accountNumber:
 *                   type: string
 *                   description: Account number
 *                 accountHolderName:
 *                   type: string
 *                   description: Name of the account holder
 *                 bank:
 *                   type: object
 *                   properties:
 *                     bankName:
 *                       type: string
 *                       description: Name of the bank
 *                     logoUrl:
 *                       type: string
 *                       description: URL of the bank's logo
 *       200:
 *         description: Account already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message indicating the account already exists
 *                 data:
 *                   type: object
 *                   description: Details of the existing account
 *       404:
 *         description: Bank not found
 */


