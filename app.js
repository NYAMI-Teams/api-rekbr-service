import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import morganBody from "morgan-body";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/docs/swagger.js";
import router from "./src/routes/index.js";
import errorHandler from "./src/middlewares/errorHandler.js";

// BullMQ & BullBoard
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { transactionQueue } from "./src/queues/transaction.queue.js";

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
});
app.use(morgan("dev"));

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// BullBoard setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(transactionQueue)],
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

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
