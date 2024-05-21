const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/catchError");
const { authenticationMiddleware } = require("../middlewares/auth.middleware");
const { grantAccess } = require("../middlewares/rbac.middleware");

const rbacController = require("../controllers/rbac.controller");
/**
 * @swagger
 * tags:
 *  name: RBAC
 *  description:
 */
router.use("/", authenticationMiddleware);

/**
 * @swagger
 * /api/v1/rbac/role:
 *  post:
 *   tags: [RBAC]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *         name:
 *          type: string
 *          example: "ADMIN"
 *         description:
 *          type: string
 *          example: "ADMIN"
 *         force:
 *          type: string
 *          example: true
 *         grants:
 *          type: array
 *          example: [{"resource": "6639de2c29e8fd28a2db1548", "actions": ["create:any", "update:any", "read:any", "delete:any"], "attributes": "*" }, {"resource": "6639de2c29e8fd28a2db1548", "actions": ["create:any", "update:any", "read:any", "delete:any"], "attributes": "*" }]
 *   responses:
 *    '200':
 *      description: OK
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 */
router.post(
  "/role",
  //   grantAccess("createAny", "rbac"),
  ErrorHandler(rbacController.newRole)
);

/**
 * @swagger
 * /api/v1/rbac/roles:
 *   get:
 *     tags: [RBAC]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get(
  "/roles",
  grantAccess("readAny", "rbac"),
  ErrorHandler(rbacController.listRoles)
);

/**
 * @swagger
 * /api/v1/rbac/roles/categories:
 *   get:
 *     tags: [RBAC]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get(
  "/roles/categories",
  grantAccess("readAny", "rbac"),
  ErrorHandler(rbacController.getRoleCategories)
);

/**
 * @swagger
 * /api/v1/rbac/resource:
 *  post:
 *   tags: [RBAC]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *         name:
 *          type: string
 *          example: ""
 *         description:
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
  "/resource",
  //   grantAccess("createAny", "rbac"),
  ErrorHandler(rbacController.newResource)
);

/**
 * @swagger
 * /api/v1/rbac/resources:
 *   get:
 *     tags: [RBAC]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get(
  "/resources",
  grantAccess("readAny", "rbac"),
  ErrorHandler(rbacController.listResources)
);

module.exports = router;
