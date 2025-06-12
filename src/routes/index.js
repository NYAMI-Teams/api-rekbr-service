import { Router } from "express";
import bankRoutes from "./bank.routes.js";
import userRoutes from "./user.routes.js";
import authentication from "../middlewares/authentication.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

router.use("/bank", bankRoutes);
router.use("/user", userRoutes);

export default router;
