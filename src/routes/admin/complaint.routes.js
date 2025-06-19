import { Router } from "express";
import complaintController from "../../controllers/admin/complaint.controller.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(complaintController.getAllComplaintList))
export default router;