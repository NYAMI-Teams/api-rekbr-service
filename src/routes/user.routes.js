import { Router } from "express";
import userController from "../controllers/user.controller.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import userValidator from "../validators/user.validator.js";
import validateRequest from "../middlewares/validateRequest.js";
import authentication from "../middlewares/authentication.js";

const router = Router();

router.post("/register", userValidator.createUserValidation, validateRequest, asyncHandler(userController.register));
router.post("/login", userValidator.loginUserValidation, validateRequest, asyncHandler(userController.login));
router.post("/resend-verify-email", userValidator.resendVerifyEmailValidation, validateRequest, asyncHandler(userController.resendVerifyEmail));
router.post("/verify-email", userValidator.verifyEmailValidation, validateRequest, asyncHandler(userController.verifyEmail));
router.post("/verify-kyc", authentication, asyncHandler(userController.verifyKyc));
router.get("/profile", authentication, asyncHandler(userController.getProfile));


export default router;

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Endpoints terkait user (registrasi, login, verifikasi, profil, dll)
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Registrasi user baru
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@email.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Registrasi berhasil, OTP dikirim ke email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Email sudah terdaftar
 */

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@email.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login berhasil, token dikembalikan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Email atau password salah
 */

/**
 * @swagger
 * /api/user/resend-verify-email:
 *   post:
 *     summary: Kirim ulang kode OTP verifikasi email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@email.com
 *     responses:
 *       200:
 *         description: OTP berhasil dikirim ulang
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /api/user/verify-email:
 *   post:
 *     summary: Verifikasi email dengan kode OTP
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otpCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@email.com
 *               otpCode:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email berhasil diverifikasi, token dikembalikan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Kode OTP tidak valid
 *       404:
 *         description: User tidak terdaftar
 */


/**
 * @swagger
 * /api/user/verify-kyc:
 *   post:
 *     summary: Verifikasi KYC user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - birthDate
 *               - lastEducation
 *               - province
 *               - city
 *               - businessField
 *             properties:
 *               fullname:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               lastEducation:
 *                 type: string
 *               province:
 *                 type: string
 *               city:
 *                 type: string
 *               businessField:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC berhasil diverifikasi
 *       400:
 *         description: KYC sudah diverifikasi
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Mendapatkan profil user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data profil user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 status:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */