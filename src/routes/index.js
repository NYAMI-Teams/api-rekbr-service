const express = require("express");
const router = express.Router();

const bankRoutes = require("./bank.routes");

router.use("/seller/bank-list", bankRoutes);

module.exports = router;
