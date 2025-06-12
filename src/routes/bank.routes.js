import { Router } from "express";
import bankController from "../controllers/bank.controller.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = Router();

router.get("/bank-list", asyncHandler(bankController.getBanks));

router.get("/account", asyncHandler(bankController.getDummyAccount));

export default router;
