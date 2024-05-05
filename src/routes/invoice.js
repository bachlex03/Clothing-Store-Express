const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/catchError");

const invoiceController = require("../controllers/invoice.controller");
/**
 * @swagger
 * tags:
 *  name: Invoices
 *  description:
 */

// /**
//  * @swagger
//  * /api/v1/invoices/currentUser:
//  *   get:
//  *     tags: [Invoices]
//  *     responses:
//  *       '200':
//  *         description: OK
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  */
// router.get("/currentUser", ErrorHandler(invoiceController.getByUserEmail));

module.exports = router;
