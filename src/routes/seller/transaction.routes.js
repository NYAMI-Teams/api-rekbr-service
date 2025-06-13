import { Router } from "express";
import transactionController from "../../controllers/seller/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import transactionValidator from "../../validators/seller.validator.js";
import validateRequest from "../../middlewares/validateRequest.js";
import authentication from "../../middlewares/authentication.js";
const router = Router();

router.get(
  "/transactions/:transactionId", 
  authentication,
  asyncHandler(transactionController.getTransactionDetailSeller)
);

router.get(
  "/transactions",
  authentication,
  asyncHandler(transactionController.getTransactionListSeller)
);

router.post(
  "/transactions",
  authentication,
  transactionValidator.createTransactionValidation,
  validateRequest,
  asyncHandler(transactionController.generateTransaction)
);

export default router;
