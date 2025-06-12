import { Router } from "express";
import bankController from "../controllers/bank.controller.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = Router();

router.get("/bank-list", asyncHandler(bankController.getBanks));

export default router;
