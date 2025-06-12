import { Router } from "express";
import transactionController from "../../controllers/seller/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

const router = Router();

router.get(
  "/transactions/:transactionId",
  asyncHandler(transactionController.getTransactionDetailSeller)
);

router.post(
  "/transactions",
  asyncHandler(transactionController.generateTransaction)
);

export default router;
