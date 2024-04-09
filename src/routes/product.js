const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/catchError");
const {
  authorizationMiddleware,
  authenticationMiddleware,
} = require("../middlewares/auth.middleware");

const productController = require("../controllers/product.controller");

/**
 * @swagger
 * tags:
 *  name: Products
 *  description: CRUD products
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     tags: [Products]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/", ErrorHandler(productController.getAll));

/**
 * @swagger
 * /api/v1/products/{slug}:
 *   get:
 *     tags: [Products]
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         description: The slug of the product
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/:slug", ErrorHandler(productController.getBySlug));

router.use("/", authenticationMiddleware);
router.use(authorizationMiddleware(["ADMIN"]));
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
 *         size:
 *          type: string
 *          example: "S"
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

// router.put("/", ErrorHandler(productController.create));

module.exports = router;
