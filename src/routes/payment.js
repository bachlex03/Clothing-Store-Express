const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/catchError");
const {
  authorizationMiddleware,
  authenticationMiddleware,
} = require("../middlewares/auth.middleware");

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
 *         addressLine:
 *          type: string
 *          example: "106* Kha Van Can, Linh Dong, Thu Duc"
 *         city:
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
router.use(authorizationMiddleware(["USER", "ADMIN"]));
router.post("/", ErrorHandler(paymentController.payInvoice));
router.get("/:id", ErrorHandler(paymentController.viewDetails));

module.exports = router;
// firstName = "",
// lastName = "",
// addressLine = "",
// city = "",
// province = "",
// country = "",
