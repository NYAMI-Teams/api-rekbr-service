import { validationResult } from "express-validator";
import throwError from "../utils/throwError.js";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwError("Validasi gagal", 400, errors.array());
  }
  next();
};

export default validateRequest;
