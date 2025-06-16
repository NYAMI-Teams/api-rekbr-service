import { body } from "express-validator";

const createTransactionValidation = [

  body("item_name").notEmpty().withMessage("Nama item wajib diisi"),

  body("item_price")
    .matches(/^\d+$/)
    .isInt({ min: 0 })
    .withMessage("Harga item harus berupa angka positif"),

  body("withdrawal_bank_account_id")
    .notEmpty()
    .withMessage("Rekening penarikan wajib diisi"),
];

export default {
  createTransactionValidation,
};
