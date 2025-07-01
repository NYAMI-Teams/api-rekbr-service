import { Router } from "express";
import downloadController from "../controllers/download.controller.js";

const router = Router();

router.get("/", downloadController.downloadFile);

export default router;
