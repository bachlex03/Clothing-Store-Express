"use strict";

const express = require("express");
const router = express.Router();
const accessController = require("../controllers/access.controller");
const ErrorHandler = require("../utils/catchError");

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
router.post("/register", ErrorHandler(accessController.register));

/**
 * @swagger
 * /api/v1/auth/login:
 *  post:
 *   tags: [Auth]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
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
router.post("/login", ErrorHandler(accessController.login));

/**
 * @swagger
 * /api/v1/auth/verify:
 *   get:
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: q is jwt mail token.
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/verify", ErrorHandler(accessController.verify));

/**
 * @swagger
 * /api/v1/auth/sendMailToken:
 *   get:
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: q is jwt mail token.
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/sendMailToken", ErrorHandler(accessController.sendMailToken));

/**
 * @swagger
 * /api/v1/auth/verifyEmail:
 *  post:
 *   tags: [Auth]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *         q:
 *          type: string
 *         mailToken:
 *          type: string
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */
router.post("/verifyEmail", ErrorHandler(accessController.verifyEmail));

/**
 * @swagger
 * /api/v1/auth/recover:
 *  post:
 *   tags: [Auth]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *         email:
 *          type: string
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */
router.post("/recover", ErrorHandler(accessController.recover));

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *    tags: [Auth]
 *    parameters:
 *      - in: query
 *        name: q
 *        schema:
 *          type: string
 *        required: true
 *        description: q is jwt mail token.
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         password:
 *          type: string
 *         confirmPassword:
 *          type: string
 *    responses:
 *     '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 */
router.post("/reset-password", ErrorHandler(accessController.resetPassword));

module.exports = router;

// *   requestBody:
// *    required: true
// *    content:
// *     application/json:
// *      schema:
// *        type: object
// *        properties:
// *         email:
// *          type: string
