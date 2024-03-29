"use strict";

const express = require("express");
const router = express.Router();

// access router
const accessRouter = require("./access");

router.use("/api/v1", accessRouter);

module.exports = router;
