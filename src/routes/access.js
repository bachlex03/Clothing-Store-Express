"use strict";

const express = require("express");
const router = express.Router();
const accessController = require("../controllers/access.controller");

router.get("/auth/login", accessController.login);

module.exports = router;
