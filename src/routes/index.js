import { Router } from "express";
import bankRoutes from "./bank.routes.js";
import userRoutes from "./user.routes.js";
import sellerTransactionRoutes from "./seller/transaction.routes.js";
import buyerTransactionRoutes from "./buyer/transaction.routes.js";
import adminTransactionRoutes from "./admin/transaction.routes.js";
import adminUserRoutes from "./admin/user.routes.js";
import complaintRoutes from "./seller/complaint.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the new API",
  });
});

router.use("/bank", bankRoutes);
router.use("/user", userRoutes);
router.use("/buyer", buyerTransactionRoutes);
router.use("/seller", sellerTransactionRoutes);
router.use("/seller", complaintRoutes);
router.use("/admin/transactions", adminTransactionRoutes);
router.use("/admin/users", adminUserRoutes);

export default router;
