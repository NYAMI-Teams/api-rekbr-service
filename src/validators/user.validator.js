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
    body("password")
        .notEmpty()
        .withMessage("Password wajib diisi"),
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
    body("otpCode")
        .notEmpty()
        .withMessage("Kode OTP wajib diisi"),
];

const verifyKycValidation = [
    body("fullname")
        .notEmpty()
        .withMessage("Nama lengkap wajib diisi"),
    body("birthDate")
        .notEmpty()
        .withMessage("Tanggal lahir wajib diisi"),
    body("lastEducation")
        .notEmpty()
        .withMessage("Pendidikan terakhir wajib diisi"),
    body("province")
        .notEmpty()
        .withMessage("Provinsi wajib diisi"),
    body("city")
        .notEmpty()
        .withMessage("Kota wajib diisi"),
    body("businessField")
        .notEmpty()
        .withMessage("Bidang usaha wajib diisi"),
];

export default {
    createUserValidation,
    loginUserValidation,
    resendVerifyEmailValidation,
    verifyEmailValidation,
};