import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import morganBody from "morgan-body";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/docs/swagger.js";
import router from "./src/routes/index.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

morganBody(app, {
  noColors: false,
  prettify: true,
  stream: process.stdout,
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
