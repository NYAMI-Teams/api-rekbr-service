import { Router } from "express";
import bankRoutes from "./bank.routes.js";
import sellerTransactionRoutes from "./seller/transaction.routes.js";
import buyerTransactionRoutes from "./buyer/transaction.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

router.use("/bank", bankRoutes);
router.use("/buyer", buyerTransactionRoutes);
router.use("/seller", sellerTransactionRoutes);

export default router;
