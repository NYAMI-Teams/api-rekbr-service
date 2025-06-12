import { Router } from "express";
import userController from "../controllers/user.controller.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import userValidator from "../validators/user.validator.js";
import validateRequest from "../middlewares/validateRequest.js";

const router = Router();

router.post("/register", userValidator.createUserValidation, validateRequest, asyncHandler(userController.register));
router.post("/login", userValidator.loginUserValidation, validateRequest, asyncHandler(userController.login));
router.post("/resend-verify-email", asyncHandler(userController.resendVerifyEmail));
router.post("/verify-email", userValidator.verifyEmailValidation, validateRequest, asyncHandler(userController.verifyEmail));

export default router;
