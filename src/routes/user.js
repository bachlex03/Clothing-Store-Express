const express = require("express");
const userController = require("../controllers/user.controller");
const router = express.Router();
const ErrorHandler = require("../utils/catchError");
const {
  authorizationMiddleware,
  authenticationMiddleware,
} = require("../middlewares/auth.middleware");
const { grantAccess } = require("../middlewares/rbac.middleware");

router.use("/", authenticationMiddleware);
// router.use(authorizationMiddleware(["USER", "ADMIN"]));

/**
 * @swagger
 * tags:
 *  name: User
 */

/**
 * @swagger
 * /api/v1/users/checkoutInfo:
 *   get:
 *     tags: [User]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get(
  "/checkoutInfo",
  grantAccess("readOwn", "users"),
  ErrorHandler(userController.getCheckoutInfo)
);

/**
 * @swagger
 * /api/v1/users/checkoutInfo:
 *  put:
 *   tags: [User]
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
 *          type: string
 *          example: "user"
 *         phoneNumber:
 *          type: string
 *          example: "0123456789"
 *         district:
 *          type: string
 *          example: "Thủ Đức"
 *         province:
 *          type: string
 *          example: "Hồ Chí Minh"
 *         country:
 *          type: string
 *          example: "Việt Nam"
 *         addressLine:
 *          type: string
 *          example: "106* Kha Van Can, Linh Dong, Thu Duc"
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */
router.put(
  "/checkoutInfo",
  grantAccess("updateOwn", "users"),
  ErrorHandler(userController.updateCheckoutInfo)
);

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     tags: [User]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get(
  "/profile",
  grantAccess("readOwn", "users"),
  ErrorHandler(userController.getProfile)
);

/**
 * @swagger
 * /api/v1/users/addresses:
 *   get:
 *     tags: [User]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

router.get(
  "/addresses",
  grantAccess("readOwn", "users"),
  ErrorHandler(userController.getAddress)
);

/**
 * @swagger
 * /api/v1/users/invoices:
 *   get:
 *     tags: [User]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get(
  "/invoices",
  grantAccess("readOwn", "users"),
  ErrorHandler(userController.getInvoices)
);

/**
 * @swagger
 * /api/v1/users/addresses:
 *  put:
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *         addressLine:
 *          type: string
 *          example: "106* Kha Van Can, Linh Dong, Thu Duc"
 *         province:
 *          type: string
 *          example: "Hồ Chí Minh"
 *         district:
 *          type: string
 *          example: "Quận 1"
 *         country:
 *          type: string
 *          example: "Việt Nam"
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */
router.put(
  "/addresses",
  grantAccess("updateOwn", "users"),
  ErrorHandler(userController.updateAddresses)
);

/**
 * @swagger
 * /api/v1/users/profile:
 *  put:
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *         firstName:
 *          type: string
 *          example: "string"
 *         lastName:
 *          type: string
 *          example: "string"
 *         phoneNumber:
 *          type: string
 *          example: "0123456789"
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */
router.put(
  "/profile",
  grantAccess("updateOwn", "users"),
  ErrorHandler(userController.updateProfile)
);

/**
 * @swagger
 * /api/v1/users/password:
 *  patch:
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *         currentPassword:
 *          type: string
 *          example: "string"
 *         newPassword:
 *          type: string
 *          example: "string"
 *         confirmPassword:
 *          type: string
 *          example: "string"
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */
router.patch(
  "/password",
  grantAccess("updateOwn", "users"),
  ErrorHandler(userController.changeCurrentPassword)
);

module.exports = router;

/**
 * @swagger
 * /api/v1/users/business-account:
 *  post:
 *   tags: [User]
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
 *         phoneNumber:
 *          type: string
 *         account:
 *          type: string
 *         password:
 *          type: string
 *         role:
 *          type: string
 *          example: "66434d1afd0d76dfa0eee8af"
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */
router.post(
  "/business-account",
  grantAccess("createAny", "users"),
  ErrorHandler(userController.createBusinessAccount)
);

/**
 * @swagger
 * /api/v1/users/business/member:
 *   get:
 *     tags: [User]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get(
  "/business/member",
  grantAccess("readAny", "users"),
  ErrorHandler(userController.getMember)
);
