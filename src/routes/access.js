"use strict";

const express = require("express");
const router = express.Router();
const accessController = require("../controllers/access.controller");

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: authentication and authorization
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *  post:
 *   tags: [Auth]
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
 *         email:
 *          type: string
 *         password:
 *          type: string
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */

router.post("/auth/register", accessController.register);

router.post("/auth/login", accessController.login);

module.exports = router;
