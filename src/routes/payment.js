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
 *          example: "user"
 *         lastName:
 *          example: "user"
 *          type: string
 *         phoneNumber:
 *          type: string
 *          example: "0123456789"
 *         country:
 *          type: string
 *          example: "Việt Nam"
 *         province:
 *          type: string
 *          example: "Hồ Chí Minh"
 *         district:
 *          type: string
 *          example: "Thủ Đức"
 *         addressLine:
 *          type: string
 *          example: "106* Kha Van Can, Linh Dong, Thu Duc"
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

router.post(
  "/cash",
  grantAccess("createOwn", "invoices"),
  ErrorHandler(paymentController.payInvoiceCash)
);

module.exports = router;
