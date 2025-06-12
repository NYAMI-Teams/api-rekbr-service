import { Router } from "express";
import transactionController from "../../controllers/buyer/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

const router = Router();

router.get(
  "/transactions/:transactionId",
  asyncHandler(transactionController.getTransactionDetailBuyer)
);

export default router;
