const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bank.controller");
const asyncHandler = require("../middlewares/asyncHandler");

router.get("/", asyncHandler(bankController.getBanks));

module.exports = router;
