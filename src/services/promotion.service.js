const promotionModel = require("../models/promotion.model");
const productModel = require("../models/product.model");
const categoryModel = require("../models/category.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");

class PromotionService {
  // Create new promotion
  static async createPromotion({
    name,
    value,
    startDate,
    endDate,
    categoryId
  }) {
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      throw new BadRequestError("End date must be after start date");
    }

    // Create promotion
    const promotion = await promotionModel.create({
      promotion_name: name,
      promotion_value: value,
      promotion_start_date: start,
      promotion_end_date: end,
      category_id: categoryId
    });

    // Update category with promotion
    await categoryModel.findByIdAndUpdate(categoryId, {
      category_promotion: promotion._id
    });

    // Update all products in this category
    await this.updateProductsPromotions(promotion, categoryId);

    return promotion;
  }

  // Get promotions with pagination and filters
  static async getPromotions({ 
    page = 1, 
    limit = 10, 
    type,
    startDate,
    endDate 
  }) {
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (type) query.promotion_type = type;
    if (startDate) query.promotion_start_date = { $gte: new Date(startDate) };
    if (endDate) query.promotion_end_date = { $lte: new Date(endDate) };

    // Get total count
    const total = await promotionModel.countDocuments(query);

    // Get promotions
    const promotions = await promotionModel.find(query)
      .sort({ promotion_end_date: -1 })
      .skip(skip)
      .limit(limit);

    // Transform data
    const transformedPromotions = promotions.map(promotion => {
      const promotionObj = promotion.toObject({ virtuals: true });
      
      return {
        _id: promotionObj._id,
        promotion_name: promotionObj.promotion_name,
        promotion_type: promotionObj.promotion_type,
        promotion_value: promotionObj.promotion_value,
        promotion_start_date: promotionObj.promotion_start_date,
        promotion_end_date: promotionObj.promotion_end_date,
        is_active: promotionObj.is_active,
        applied_products: promotionObj.applied_products,
        applied_categories: promotionObj.applied_categories,
        createdAt: promotionObj.createdAt,
        updatedAt: promotionObj.updatedAt
      };
    });

    return {
      data: transformedPromotions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get promotion by ID
  static async getPromotionById(id) {
    const promotion = await promotionModel.findById(id);

    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    // Transform data to include only IDs
    const promotionObj = promotion.toObject({ virtuals: true });
    
    return {
      _id: promotionObj._id,
      promotion_name: promotionObj.promotion_name,
      promotion_type: promotionObj.promotion_type,
      promotion_value: promotionObj.promotion_value,
      promotion_start_date: promotionObj.promotion_start_date,
      promotion_end_date: promotionObj.promotion_end_date,
      is_active: promotionObj.is_active,
      applied_products: promotionObj.applied_products,
      applied_categories: promotionObj.applied_categories,
      createdAt: promotionObj.createdAt,
      updatedAt: promotionObj.updatedAt
    };
  }

  // Update promotion
  static async updatePromotion(updateData) {
    const {
      id,
      name,
      value,
      startDate,
      endDate,
      categoryId
    } = updateData;

    // Validate required fields
    if (!id) {
      throw new BadRequestError("Promotion ID is required");
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      throw new BadRequestError("End date must be after start date");
    }

    const promotion = await promotionModel.findById(id);
    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    // Update all fields
    promotion.promotion_name = name;
    promotion.promotion_value = value;
    promotion.promotion_start_date = start;
    promotion.promotion_end_date = end;
    promotion.category_id = categoryId;

    await promotion.save();

    // Update category with promotion
    await categoryModel.findByIdAndUpdate(categoryId, {
      category_promotion: promotion._id
    });

    // Update all products in this category
    await this.updateProductsPromotions(promotion, categoryId);

    // Return updated promotion
    const updatedPromotion = await promotionModel.findById(id);
    const promotionObj = updatedPromotion.toObject({ virtuals: true });
    
    return {
      _id: promotionObj._id,
      promotion_name: promotionObj.promotion_name,
      promotion_type: promotionObj.promotion_type,
      promotion_value: promotionObj.promotion_value,
      promotion_start_date: promotionObj.promotion_start_date,
      promotion_end_date: promotionObj.promotion_end_date,
      is_active: promotionObj.is_active,
      applied_products: promotionObj.applied_products,
      applied_categories: promotionObj.applied_categories,
      createdAt: promotionObj.createdAt,
      updatedAt: promotionObj.updatedAt
    };
  }

  // Delete promotion
  static async deletePromotion(id) {
    const promotion = await promotionModel.findById(id);
    if (!promotion) {
      throw new NotFoundError('Promotion not found');
    }

    // Remove promotion from category
    await categoryModel.findByIdAndUpdate(promotion.category_id, {
      category_promotion: null
    });

    // Remove promotion from all affected products
    await productModel.updateMany(
      { 'product_promotion.promotion_id': promotion._id },
      { product_promotion: null }
    );

    await promotionModel.findByIdAndDelete(id);
    return { success: true };
  }

  // Update products promotions
  static async updateProductsPromotions(promotion, categoryId) {
    // Update all products in the category
    await productModel.updateMany(
      { product_category: categoryId },
      {
        product_promotion: {
          promotion_id: promotion._id,
          current_discount: promotion.promotion_value,
          start_date: promotion.promotion_start_date,
          end_date: promotion.promotion_end_date
        }
      }
    );
  }

  // Update promotion status
  static async cleanupExpiredPromotions() {
    const now = new Date();

    // Find expired promotions
    const expiredPromotions = await promotionModel.find({
      promotion_end_date: { $lte: now }
    });

    // Remove expired promotions from products
    for (const promotion of expiredPromotions) {
      await productModel.updateMany(
        { product_promotions: promotion._id },
        { $pull: { product_promotions: promotion._id } }
      );
    }
  }
}

module.exports = PromotionService;