import { Router } from "express";
import pushTokenController from "../controllers/pushToken.controller.js";
import authentication from "../middlewares/authentication.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = Router();

router.post(
  "/",
  authentication,
  asyncHandler(pushTokenController.savePushToken)
);

export default router;
