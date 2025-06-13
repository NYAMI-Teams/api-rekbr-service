import { Router } from "express";
import bankController from "../controllers/bank.controller.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import accountValidator from "../validators/bank.validator.js";
import validateRequest from "../middlewares/validateRequest.js";
import authentication from "../middlewares/authentication.js";

const router = Router();

router.get("/bank-list", authentication, asyncHandler(bankController.getBanks));

router.get("/account", authentication, asyncHandler(bankController.getDummyAccount));

router.get("/account-list", authentication, asyncHandler(bankController.getAccounts));

router.post("/account", authentication, accountValidator.createAccountValidation, validateRequest, asyncHandler(bankController.postAccount));

export default router;
