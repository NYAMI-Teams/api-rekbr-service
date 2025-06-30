import { Router } from "express";
import userController from "../controllers/user.controller.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import userValidator from "../validators/user.validator.js";
import validateRequest from "../middlewares/validateRequest.js";
import authentication from "../middlewares/authentication.js";

const router = Router();

router.post(
  "/register",
  userValidator.createUserValidation,
  validateRequest,
  asyncHandler(userController.register)
);
router.post(
  "/login",
  userValidator.loginUserValidation,
  validateRequest,
  asyncHandler(userController.login)
);
router.post(
  "/resend-verify-email",
  userValidator.resendVerifyEmailValidation,
  validateRequest,
  asyncHandler(userController.resendVerifyEmail)
);
router.post(
  "/verify-email",
  userValidator.verifyEmailValidation,
  validateRequest,
  asyncHandler(userController.verifyEmail)
);
router.post(
  "/verify-kyc",
  authentication,
  asyncHandler(userController.verifyKyc)
);

router.get("/profile", authentication, asyncHandler(userController.getProfile));

router.get("/check-user", asyncHandler(userController.getEmail));

router.post(
  "/change-password",
  authentication,
  userValidator.changePasswordValidation,
  validateRequest,
  asyncHandler(userController.changePassword)
);

router.post(
  "/forgot-password",
  userValidator.forgotPasswordValidation,
  validateRequest,
  asyncHandler(userController.forgotPassword)
);

router.post(
  "/verify-otp-reset-password",
  userValidator.verifyOtpResetPasswordValidation,
  validateRequest,
  asyncHandler(userController.verifyOtpResetPassword)
);
router.post(
  "/reset-password",
  userValidator.resetPasswordValidation,
  validateRequest,
  asyncHandler(userController.resetPassword)
);

export default router;

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Endpoints terkait user (registrasi, login, verifikasi, profil, dll)
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

/**
 * @swagger
 * /api/user/check-user:
 *   get:
 *     summary: Memeriksa keberadaan user berdasarkan email
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *           example: user@email.com
 *         description: Email user yang ingin diperiksa
 *     responses:
 *       200:
 *         description: User ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 id:
 *                   type: integer
 *       400:
 *         description: User tidak ditemukan
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
 *                 example: seller@gmail.com
 *               password:
 *                 type: string
 *                 example: pass123
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
 * /api/user/change-password:
 *   post:
 *     summary: Mengubah password user
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
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Password lama
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 description: Password baru
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password berhasil diubah
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengubah password
 *       400:
 *         description: Validasi gagal atau password lama salah
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/forgot-password:
 *   post:
 *     summary: Mengirim OTP untuk reset password
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
 *                 description: Email user
 *                 example: user@email.com
 *     responses:
 *       200:
 *         description: OTP reset password berhasil dikirim ke email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP reset password berhasil dikirim ke email
 *       404:
 *         description: Email tidak ditemukan
 */

/**
 * @swagger
 * /api/user/verify-reset-otp:
 *   post:
 *     summary: Verifikasi OTP untuk reset password
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
 *                 description: Email user
 *                 example: user@email.com
 *               otpCode:
 *                 type: string
 *                 description: Kode OTP
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP berhasil diverifikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP berhasil diverifikasi
 *       400:
 *         description: Kode OTP tidak valid atau sudah kadaluarsa
 */

/**
 * @swagger
 * /api/user/reset-password:
 *   post:
 *     summary: Reset password user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email user
 *                 example: user@email.com
 *               newPassword:
 *                 type: string
 *                 description: Password baru
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password berhasil direset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password berhasil direset
 *       400:
 *         description: OTP belum diverifikasi
 *       404:
 *         description: User tidak ditemukan
 */
