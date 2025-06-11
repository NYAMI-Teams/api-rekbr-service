const express = require("express");
const router = require("./src/routes");
const errorHandler = require("./src/middlewares/errorHandler");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use("/api", router);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
