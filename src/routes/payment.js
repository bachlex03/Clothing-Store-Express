const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/catchError");
const paymentController = require("../controllers/payment.controller");

router.post("/", ErrorHandler(paymentController.payInvoice));
router.get("/:id", ErrorHandler(paymentController.viewDetails));

module.exports = new paymentController();
