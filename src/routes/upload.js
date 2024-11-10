const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/catchError");
const {
  authorizationMiddleware,
  authenticationMiddleware,
} = require("../middlewares/auth.middleware");
const { grantAccess } = require("../middlewares/rbac.middleware");
const uploadController = require("../controllers/upload.controller");

const {
  upload: uploadMiddleware,
} = require("../middlewares/upload.middleware");

/**
 * @swagger
 * tags:
 *  name: Cloudinary
 */

/**
 * @swagger
 * /api/v1/upload/images:
 *   get:
 *     tags: [Cloudinary]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/images", ErrorHandler(uploadController.getAll));

/**
 * @swagger
 * /api/v1/upload/single:
 *   post:
 *     tags: [Cloudinary]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: file
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Promotion created successfully
 */
router.post(
  "/single",
  uploadMiddleware.single("image"),
  ErrorHandler(uploadController.uploadSingle)
);

/**
 * @swagger
 * /api/v1/upload/multiple:
 *   post:
 *     tags: [Cloudinary]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: file
 *                   format: binary
 *     responses:
 *       201:
 *         description: Promotion created successfully
 */
router.post(
  "/multiple",
  uploadMiddleware.array("images", 5),
  ErrorHandler(uploadController.uploadMultiple)
);

module.exports = router;
