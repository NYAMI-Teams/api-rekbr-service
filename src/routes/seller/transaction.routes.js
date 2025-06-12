import { Router } from "express";
import sellerTransactionController from "../../controllers/seller/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

const router = Router();

router.get(
  "/transactions/:transactionId",
  asyncHandler(sellerTransactionController.getTransactionDetailSeller)
);

router.post(
  "/transactions/:transactionId/shipment",
  asyncHandler(sellerTransactionController.inputShipment)
);

export default router;
