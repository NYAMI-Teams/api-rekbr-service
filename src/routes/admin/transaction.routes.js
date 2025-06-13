import { Router } from "express";
import adminTransactionController from "../../controllers/admin/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authentication from "../../middlewares/authentication.js";

const router = Router();

router.get(
  "/transactions",
  authentication,
  asyncHandler(adminTransactionController.getAllTransactions)
);

router.get(
  "/transactions/:transactionId",
  authentication,
  asyncHandler(adminTransactionController.getTransactionDetailById)
);

export default router;
