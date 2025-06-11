const { validationResult } = require("express-validator");
const throwError = require("../utils/throwError");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwError("Validasi gagal", 400, errors.array());
  }
  next();
};

module.exports = validateRequest;
