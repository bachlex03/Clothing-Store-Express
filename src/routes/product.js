const express = require("express");
const router = express.Router();
const path = require("path");
const ErrorHandler = require("../utils/catchError");
const {
  authorizationMiddleware,
  authenticationMiddleware,
} = require("../middlewares/auth.middleware");

const {
  upload: uploadMiddleware,
} = require("../middlewares/upload.middleware");

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

// router.use("/", authenticationMiddleware);
// router.use(authorizationMiddleware(["ADMIN"]));
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
 *         gender:
 *          type: string
 *          default: "Unisex"
 *         type:
 *          type: string
 *          default: "Clothe"
 *         brand:
 *          type: string
 *          default: "louis vuitton"
 *         categoryId:
 *          type: string
 *          default: "66138a1018286bb5eafa3567"
 *         categoryName:
 *          type: string
 *          default: "Outerwear"
 *         sizes:
 *          type: array
 *          example: ["S"]
 *         color:
 *          type: string
 *          example: "Red"
 *         price:
 *          type: string
 *          example: "100"
 *         quantity:
 *          type: string
 *          example: "20"
 *         status:
 *          type: string
 *          example: "Draft"
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
  uploadMiddleware.array("images", 10),
  ErrorHandler(productController.create)
);

/**
 * @swagger
 * /api/v1/products/{slug}/images:
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
router.get("/:slug/images", ErrorHandler(productController.getImages));

// router.put("/", ErrorHandler(productController.create));

module.exports = router;
