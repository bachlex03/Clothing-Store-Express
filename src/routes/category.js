const express = require("express");
const router = express.Router();

const ErrorHandler = require("../utils/catchError");
const categoryController = require("../controllers/category.controller");
const { authenticationMiddleware } = require("../middlewares/auth.middleware");
const { grantAccess } = require("../middlewares/rbac.middleware");

/**
 * @swagger
 * tags:
 *  name: Categories
 *  description: CRUD categories
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     tags: [Categories]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/", ErrorHandler(categoryController.getAll));

/**
 * @swagger
 * /api/v1/categories/withChildren:
 *   get:
 *     tags: [Categories]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/withChildren", ErrorHandler(categoryController.withChildren));

router.use(authenticationMiddleware);
/**
 * @swagger
 * /api/v1/categories:
 *  post:
 *   tags: [Categories]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *         name:
 *          type: string
 *         parentId:
 *          type: string
 *          example: ""
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
  grantAccess("createAny", "categories"),
  ErrorHandler(categoryController.create)
);

module.exports = router;
