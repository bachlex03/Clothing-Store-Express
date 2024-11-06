const PromotionService = require('../services/promotion.service');
const { CREATED, OK } = require('../core/success.response');

class PromotionController {
  // Create new promotion
  async createPromotion(req, res) {
    new CREATED({
      message: 'Promotion created successfully',
      statusCode: 201,
      data: await PromotionService.createPromotion(req.body)
    }).send(res);
  }

  // Get all promotions with pagination and filters
  async getPromotions(req, res) {
    new OK({
      message: 'Get promotions successfully',
      statusCode: 200,
      data: await PromotionService.getPromotions(req.query)
    }).send(res);
  }

  // Get promotion by ID
  async getPromotionById(req, res) {
    new OK({
      message: 'Get promotion successfully',
      statusCode: 200,
      data: await PromotionService.getPromotionById(req.params.id)
    }).send(res);
  }

  // Update promotion
  async updatePromotion(req, res) {
    new OK({
      message: 'Update promotion successfully',
      statusCode: 200,
      data: await PromotionService.updatePromotion(req.body)
    }).send(res);
  }

  // Delete promotion
  async deletePromotion(req, res) {
    new OK({
      message: 'Delete promotion successfully',
      statusCode: 200,
      data: await PromotionService.deletePromotion(req.params.id)
    }).send(res);
  }
  
}

module.exports = new PromotionController(); 