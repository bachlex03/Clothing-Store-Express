const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');
const { authenticationMiddleware } = require('../middlewares/auth.middleware');
const { grantAccess } = require('../middlewares/rbac.middleware');
const ErrorHandler = require('../utils/catchError');

/**
 * @swagger
 * tags:
 *  name: Promotions
 */

router.use('/', authenticationMiddleware);

/**
 * @swagger
 * /api/v1/promotions:
 *   post:
 *     tags: [Promotions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - value
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Summer Sale 2024"
 *               type:
 *                 type: string
 *                 enum: [product, category]
 *                 example: "product"
 *               value:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 20
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-01T00:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-30T23:59:59.999Z"
 *               appliedProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["product_id_1", "product_id_2"]
 *               appliedCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *     responses:
 *       201:
 *         description: Promotion created successfully
 */
router.post('/',
  // grantAccess('createAny', 'promotion'),
  ErrorHandler(promotionController.createPromotion)
);

/**
 * @swagger
 * /api/v1/promotions:
 *   get:
 *     tags: [Promotions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [product, category]
 *         description: Filter by promotion type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of promotions
 */
router.get('/',
  // grantAccess('readAny', 'promotion'),
  ErrorHandler(promotionController.getPromotions)
);

/**
 * @swagger
 * /api/v1/promotions/{id}:
 *   get:
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promotion ID
 *     responses:
 *       200:
 *         description: Promotion details
 *       404:
 *         description: Promotion not found
 */
router.get('/:id',
  // grantAccess('readAny', 'promotion'),
  ErrorHandler(promotionController.getPromotionById)
);

/**
 * @swagger
 * /api/v1/promotions:
 *   put:
 *     tags: [Promotions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - type
 *               - value
 *               - startDate
 *               - endDate
 *             properties:
 *               id:
 *                 type: string
 *                 description: Promotion ID
 *               name:
 *                 type: string
 *                 example: "Summer Sale 2024"
 *               type:
 *                 type: string
 *                 enum: [product, category]
 *                 example: "product"
 *               value:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 20
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-01T00:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-30T23:59:59.999Z"
 *               appliedProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["product_id_1", "product_id_2"]
 *               appliedCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *     responses:
 *       200:
 *         description: Promotion updated successfully
 *       404:
 *         description: Promotion not found
 */
router.put('/',
  // grantAccess('updateAny', 'promotion'),
  ErrorHandler(promotionController.updatePromotion)
);

/**
 * @swagger
 * /api/v1/promotions/{id}:
 *   delete:
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promotion ID
 *     responses:
 *       200:
 *         description: Promotion deleted successfully
 *       404:
 *         description: Promotion not found
 */
router.delete('/:id',
  // grantAccess('deleteAny', 'promotion'),
  ErrorHandler(promotionController.deletePromotion)
);

module.exports = router; 