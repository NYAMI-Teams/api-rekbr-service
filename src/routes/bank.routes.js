import { Router } from "express";
import bankController from "../controllers/bank.controller.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import accountValidator from "../validators/bank.validator.js";
import validateRequest from "../middlewares/validateRequest.js";

const router = Router();

router.get("/bank-list", asyncHandler(bankController.getBanks));

router.get("/account", asyncHandler(bankController.getDummyAccount));

router.get("/account-list", asyncHandler(bankController.getAccounts));

router.post("/account", accountValidator.createAccountValidation, validateRequest, asyncHandler(bankController.postAccount));

export default router;
