const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/catchError");
const { authenticationMiddleware } = require("../middlewares/auth.middleware");

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

router.use("/", authenticationMiddleware);

/**
 * @swagger
 * /api/v1/invoices:
 *   get:
 *     tags: [Invoices]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: OK
 *       '401':
 *         description: Unauthorized - Authentication required
 */
router.get(
  "/",
  ErrorHandler(invoiceController.getAllInvoices)
);

module.exports = router;