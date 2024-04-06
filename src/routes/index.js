"use strict";

const express = require("express");
const router = express.Router();

const accessRouter = require("./access");
const userRouter = require("./user");

router.use("/api/v1/auth", accessRouter);
router.use("/api/v1/users", userRouter);

module.exports = router;
