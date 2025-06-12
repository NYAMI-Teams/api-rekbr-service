import { Router } from "express";
import bankRoutes from "./bank.routes.js";
import userRoutes from "./user.routes.js";
import authentication from "../middlewares/authentication.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import sellerTransactionRoutes from "./seller/transaction.routes.js";
import buyerTransactionRoutes from "./buyer/transaction.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

router.use("/bank", bankRoutes);
router.use("/user", userRoutes);
router.use("/buyer", buyerTransactionRoutes);
router.use("/seller", sellerTransactionRoutes);

export default router;
