"use strict";

const express = require("express");
const router = express.Router();

const accessRouter = require("./access");
const userRouter = require("./user");
const productRouter = require("./product");

router.use("/api/v1/auth", accessRouter);
router.use("/api/v1/users", userRouter);
router.use("/api/v1/products", productRouter);

module.exports = router;
