import { Router } from "express";
import buyerTransactionController from "../../controllers/buyer/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

const router = Router();

router.get(
  "/transactions/:transactionId",
  asyncHandler(buyerTransactionController.getTransactionDetailBuyer)
);

router.post(
  "/transactions/:transactionId/simulate-payment",
  asyncHandler(buyerTransactionController.simulatePayment)
);

export default router;
