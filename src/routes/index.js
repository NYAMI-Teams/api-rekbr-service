import { Router } from "express";
import bankRoutes from "./bank.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

router.use("/bank", bankRoutes);

export default router;
