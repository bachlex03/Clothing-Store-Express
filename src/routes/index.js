"use strict";

const express = require("express");
const router = express.Router();

const accessRouter = require("./access");
const userRouter = require("./user");
const productRouter = require("./product");
const categoryRouter = require("./category");
const paymentRouter = require("./payment");
const vnpayRouter = require("./vnpay");
const rbacRouter = require("./rbac");

router.use("/api/v1/auth", accessRouter);
router.use("/api/v1/users", userRouter);
router.use("/api/v1/products", productRouter);
router.use("/api/v1/categories", categoryRouter);
router.use("/api/v1/payment", paymentRouter);
router.use("/api/v1/vnpay", vnpayRouter);
router.use("/api/v1/rbac", rbacRouter);

module.exports = router;
