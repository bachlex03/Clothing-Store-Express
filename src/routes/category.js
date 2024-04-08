const express = require("express");
const router = express.Router();

const ErrorHandler = require("../utils/catchError");
const categoryController = require("../controllers/category.controller");

/**
 * @swagger
 * tags:
 *  name: Categories
 *  description: CRUD categories
 */

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
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */
router.post("/", ErrorHandler(categoryController.create));

module.exports = router;
