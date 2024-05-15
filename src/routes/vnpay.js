const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/catchError");
const { authenticationMiddleware } = require("../middlewares/auth.middleware");
const { grantAccess } = require("../middlewares/rbac.middleware");

const vnpayController = require("../controllers/vnpay.controller");

/**
 * @swagger
 * tags:
 *  name: Vnpay
 *  description: third party payment gateway
 */
router.use("/", authenticationMiddleware);

/**
 * @swagger
 * /api/v1/vnpay:
 *  post:
 *   tags: [Vnpay]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *         firstName:
 *          type: string
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */
router.post(
  "/",
  grantAccess("createOwn", "invoices"),
  ErrorHandler(vnpayController.createPaymentUrl)
);

/**
 * @swagger
 * /api/v1/vnpay/vnpay_ipn:
 *   get:
 *     tags: [Vnpay]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get(
  "/vnpay_ipn",
  grantAccess("createOwn", "invoices"),
  ErrorHandler(vnpayController.vnpayIpn)
);

module.exports = router;
