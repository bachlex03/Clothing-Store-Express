const express = require("express");
const adminController = require("../controllers/admin.controller");
const router = express.Router();
const ErrorHandler = require("../utils/catchError");
const {
    authenticationMiddleware,
} = require("../middlewares/auth.middleware");

router.use("/", authenticationMiddleware);

/**
 * @swagger
 * tags:
 *  name: Admin
 */

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get dashboard data successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_revenues:
 *                       type: number
 *                       example: 1000000
 *                     total_users:
 *                       type: number
 *                       example: 1000
 *                     total_sales:
 *                       type: number
 *                       example: 1000
 *                     total_product_actives:
 *                       type: number
 *                       example: 100
 */
router.get("/dashboard", ErrorHandler(adminController.getDashboardData));

module.exports = router;
