import { Router } from "express";
import authentication from "../../middlewares/authentication.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import multer from "multer";
import complaintController from "../../controllers/buyer/complaint.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/transactions/:transactionId/complaint",
  authentication,
  upload.array("evidence"),
  asyncHandler(complaintController.createComplaint)
);

router.post(
  "/complaints/:complaintId/cancel",
  authentication,
  asyncHandler(complaintController.cancelComplaint)
);

router.get(
  "/complaints",
  authentication,
  asyncHandler(complaintController.getComplaintList)
);

router.get(
  "/complaints/:complaintId",
  authentication,
  asyncHandler(complaintController.getComplaintDetail)
);

router.post(
  "/complaints/:complaintId/return",
  authentication,
  upload.single("photo"),
  asyncHandler(complaintController.submitReturnShipment)
);

export default router;
