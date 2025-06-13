import { Router } from "express";
import adminTransactionController from "../../controllers/admin/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authentication from "../../middlewares/authentication.js";
import authorization from "../../middlewares/authorization.js";

const router = Router();

router.get(
  "/transactions",
  authentication,
  authorization,
  asyncHandler(adminTransactionController.getAllTransactions)
);

router.get(
  "/transactions/:transactionId",
  authentication,
  authorization,
  asyncHandler(adminTransactionController.getTransactionDetailById)
);

router.post(
  '/transactions/:transactionId/fund-release/:action',
  authentication,
  authorization,
  asyncHandler(adminTransactionController.updateFundReleaseRequestStatus)
);

export default router;
