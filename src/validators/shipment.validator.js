import { body } from "express-validator";

const inputShipmentValidator = [
  body("courier_id").notEmpty().withMessage("ID kurir wajib diisi"),
  body("tracking_number").notEmpty().withMessage("Nomor resi wajib diisi"),
];

export default {
  inputShipmentValidator,
};
