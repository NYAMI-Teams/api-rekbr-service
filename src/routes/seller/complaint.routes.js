import { Router } from "express";
import complaintController from "../../controllers/seller/complaint.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import transactionValidator from "../../validators/seller.validator.js";
import validateRequest from "../../middlewares/validateRequest.js";
import authentication from "../../middlewares/authentication.js";
import uploadImage from "../../middlewares/uploadImage.js";
import shipmentValidator from "../../validators/shipment.validator.js";
const router = Router();

router.patch(
  "/complaints/:transactionId/respond",
  authentication,
  asyncHandler(complaintController.patchSellerResponse)
);

export default router;