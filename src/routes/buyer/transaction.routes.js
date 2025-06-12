import { Router } from "express";
import buyerTransactionController from "../../controllers/buyer/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authentication from "../../middlewares/authentication.js";

const router = Router();

router.get(
  "/transactions/:transactionId",
  authentication,
  asyncHandler(buyerTransactionController.getTransactionDetailBuyer)
);

router.post(
  "/transactions/:transactionId/simulate-payment",
  authentication,
  asyncHandler(buyerTransactionController.simulatePayment)
);

router.post(
  "/transactions/:transactionId/confirm-received",
  authentication,
  asyncHandler(buyerTransactionController.confirmReceived)
);

export default router;
