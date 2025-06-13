import { body } from "express-validator";

const createAccountValidation = [
  body("user_id")
    .notEmpty()
    .withMessage("User ID wajib diisi"),

  body("bank_id")
    .notEmpty()
    .withMessage("Bank ID wajib diisi"),

  body("account_number")
    .notEmpty()
    .withMessage("Nomor rekening wajib diisi"),

  body("account_holder_name")
    .notEmpty()
    .withMessage("Nama pemilik rekening wajib diisi")
];

export default {
  createAccountValidation,
};