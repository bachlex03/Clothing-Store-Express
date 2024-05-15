const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/catchError");
const {
  authorizationMiddleware,
  authenticationMiddleware,
} = require("../middlewares/auth.middleware");
const { grantAccess } = require("../middlewares/rbac.middleware");

const paymentController = require("../controllers/paymentController");

router.use("/", authenticationMiddleware);

/**
 * @swagger
 * tags:
 *  name: Payment
 *  description: CRUD products
 */

/**
 * @swagger
 * /api/v1/payment:
 *  post:
 *   tags: [Payment]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *         firstName:
 *          type: string
 *         lastName:
 *          type: string
 *         phoneNumber:
 *          type: string
 *          example: "0123456789"
 *         addressLine:
 *          type: string
 *          example: "106* Kha Van Can, Linh Dong, Thu Duc"
 *         city:
 *          type: string
 *          example: "Thu Duc"
 *         province:
 *          type: string
 *          example: "Ho Chi Minh"
 *         country:
 *          type: string
 *          example: "Vietnam"
 *         boughtItems:
 *          type: array
 *          example: [{"slug":"test-product","size":"S","color":"Red","quantity":1, "price": 100}]
 *         totalPrice:
 *          type: string
 *          example: "100"
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
  ErrorHandler(paymentController.payInvoice)
);

router.get(
  "/:id",
  grantAccess("readOwn", "invoices"),
  ErrorHandler(paymentController.viewDetails)
);

/**
 * @swagger
 * /api/v1/payment/updateAddresses:
 *  post:
 *   tags: [Payment]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *         firstName:
 *          type: string
 *         lastName:
 *          type: string
 *         phoneNumber:
 *          type: string
 *          example: "0123456789"
 *         addressLine:
 *          type: string
 *          example: "106* Kha Van Can, Linh Dong, Thu Duc"
 *         city:
 *          type: string
 *          example: "Thu Duc"
 *         province:
 *          type: string
 *          example: "Ho Chi Minh"
 *         country:
 *          type: string
 *          example: "Vietnam"
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */
router.post(
  "/updateAddresses",
  grantAccess("updateOwn", "invoices"),
  ErrorHandler(paymentController.updateAddresses)
);

module.exports = router;
