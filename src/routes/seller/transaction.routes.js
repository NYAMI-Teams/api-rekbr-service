import { Router } from "express";
import transactionController from "../../controllers/seller/transaction.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authentication from "../../middlewares/authentication.js";
import uploadImage from "../../middlewares/uploadImage.js";

const router = Router();

router.post("/transaction/:transactionId/request-confirmation-shipment", authentication, uploadImage("evidance"), asyncHandler(transactionController.confirmationShipmentRequest));
router.get("/transactions/:transactionId", asyncHandler(transactionController.getTransactionDetailSeller));

export default router;
