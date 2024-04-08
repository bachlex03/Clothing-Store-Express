"use strict";

const express = require("express");
const router = express.Router();

const accessRouter = require("./access");
const userRouter = require("./user");
const productRouter = require("./product");
const categoryRouter = require("./category");

router.use("/api/v1/auth", accessRouter);
router.use("/api/v1/users", userRouter);
router.use("/api/v1/products", productRouter);
router.use("/api/v1/categories", categoryRouter);

module.exports = router;
