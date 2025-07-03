import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import morganBody from "morgan-body";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/docs/swagger.js";
import router from "./src/routes/index.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import apiRateLimiter from "./src/middlewares/rateLimiter.js";
import bullBoardAdapter from "./src/libs/bullBoard.js";

const app = express();

// Middleware dasar
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
morganBody(app, {
  noColors: false,
  prettify: true,
  stream: process.stdout,
  filterParameters: [
    "password",
    "accessToken",
    "refreshToken",
    "token",
    "pushToken",
  ],
});

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Bull Board for monitoring queues
app.use("/admin/queues", bullBoardAdapter.getRouter());

// Rate Limiter
app.use("/api", apiRateLimiter);

// Routing & error handler
app.use("/api", router);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 BullBoard: http://localhost:${PORT}/admin/queues`);
  console.log(`📘 Swagger: http://localhost:${PORT}/api-docs`);
});
