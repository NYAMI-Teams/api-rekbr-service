import { body } from "express-validator";

const createTransactionValidation = [
  body("seller_id").notEmpty().withMessage("Seller ID wajib diisi"),

  body("buyer_id").notEmpty().withMessage("Buyer ID wajib diisi"),

  body("item_name").notEmpty().withMessage("Nama item wajib diisi"),

  body("item_price")
    .matches(/^\d+$/)
    .isInt({ min: 0 })
    .withMessage("Harga item harus berupa angka positif"),

  body("status").notEmpty().withMessage("Status transaksi wajib diisi"),

  body("virtual_account_number").notEmpty().withMessage("Nomor VA wajib diisi"),
  
  body("withdrawal_bank_account_id")
    .notEmpty()
    .withMessage("Rekening penarikan wajib diisi"),
];

export default {
  createTransactionValidation,
};
