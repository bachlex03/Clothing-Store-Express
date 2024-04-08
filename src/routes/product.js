const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");

const ErrorHandler = require("../utils/catchError");

/**
 * @swagger
 * tags:
 *  name: Products
 *  description: CRUD products
 */

/**
 * @swagger
 * /api/v1/products:
 *  post:
 *   tags: [Products]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *         name:
 *          type: string
 *         description:
 *          type: string
 *         sizes:
 *          type: array
 *          example: ["S", "M"]
 *         color:
 *          type: string
 *          example: "Red"
 *         price:
 *          type: string
 *          example: "100"
 *         quantity:
 *          type: string
 *          example: "20"
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */
router.post("/", ErrorHandler(productController.create));
router.get("/", ErrorHandler(productController.create));
router.get("/:slug", ErrorHandler(productController.create));
router.put("/", ErrorHandler(productController.create));

module.exports = router;
