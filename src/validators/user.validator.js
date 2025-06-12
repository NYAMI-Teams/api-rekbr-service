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

export default {
    createUserValidation,
    loginUserValidation,
    verifyEmailValidation,
};