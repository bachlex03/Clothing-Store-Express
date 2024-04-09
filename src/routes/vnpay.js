const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/catchError");

const vnpayController = require("../controllers/vnpay.controller");

/**
 * @swagger
 * tags:
 *  name: Vnpay
 *  description: third party payment gateway
 */

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
router.post("/", ErrorHandler(vnpayController.createPaymentUrl));

module.exports = router;
