import { body } from "express-validator";

const createUserValidation = [
  body("email")
    .isEmail()
    .withMessage("Email tidak valid")
    .notEmpty()
    .withMessage("Email wajib diisi"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter")
    .notEmpty()
    .withMessage("Password wajib diisi"),
];

const loginUserValidation = [
  body("email")
    .isEmail()
    .withMessage("Email tidak valid")
    .notEmpty()
    .withMessage("Email wajib diisi"),
  body("password").notEmpty().withMessage("Password wajib diisi"),
];

const resendVerifyEmailValidation = [
  body("email")
    .isEmail()
    .withMessage("Email tidak valid")
    .notEmpty()
    .withMessage("Email wajib diisi"),
];

const verifyEmailValidation = [
  body("email")
    .isEmail()
    .withMessage("Email tidak valid")
    .notEmpty()
    .withMessage("Email wajib diisi"),
  body("otpCode").notEmpty().withMessage("Kode OTP wajib diisi"),
];

const verifyKycValidation = [
  body("fullname").notEmpty().withMessage("Nama lengkap wajib diisi"),
  body("birthDate").notEmpty().withMessage("Tanggal lahir wajib diisi"),
  body("lastEducation")
    .notEmpty()
    .withMessage("Pendidikan terakhir wajib diisi"),
  body("province").notEmpty().withMessage("Provinsi wajib diisi"),
  body("city").notEmpty().withMessage("Kota wajib diisi"),
  body("businessField").notEmpty().withMessage("Bidang usaha wajib diisi"),
];

const changePasswordValidation = [
  body("oldPassword").notEmpty().withMessage("Password lama wajib diisi"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password baru minimal 6 karakter"),
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Email tidak valid"),
];

const verifyOtpResetPasswordValidation = [
  body("email").isEmail().withMessage("Email tidak valid"),
  body("otpCode")
    .isLength({ min: 6, max: 6 })
    .withMessage("Kode OTP harus 6 digit"),
];

const resetPasswordValidation = [
  body("email").isEmail().withMessage("Email tidak valid"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter"),
];

export default {
  createUserValidation,
  loginUserValidation,
  resendVerifyEmailValidation,
  verifyEmailValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  verifyOtpResetPasswordValidation,
  resetPasswordValidation,
};
