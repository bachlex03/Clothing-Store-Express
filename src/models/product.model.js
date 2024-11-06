"use strict";

const { model, Schema } = require("mongoose");
const mongoose = require("mongoose");
var slug = require("mongoose-slug-updater");
mongoose.plugin(slug);
const categoryModel = require("./category.model");

const COLLECTION_NAME = "Products";
const DOCUMENT_NAME = "Product";

const imageSchema = new Schema({
  asset_id: {
    type: String,
    default: "",
  },
  public_id: {
    type: String,
    default: "",
  },
  format: {
    type: String,
    default: "",
  },
  resource_type: {
    type: String,
    default: "",
  },
  secure_url: {
    type: String,
    default: "",
  },
  original_filename: {
    type: String,
    default: "",
  },
});

const productSchema = new Schema(
  {
    product_code: {
      type: String,
      default: "",
      trim: true,
    },
    product_name: {
      type: String,
      default: "",
      trim: true,
    },
    product_description: {
      type: String,
      default: "No description yet",
      trim: true,
    },
    product_sizes: {
      type: [String],
      enum: ["S", "M", "L", "XL", "2XL"],
      required: true,
    },
    product_colors: {
      type: [String],
      enum: ["Yellow", "Red", "Brown", "Gray", "Pink", "White"],
      required: true,
    },
    product_stocks: {
      type: Number,
      default: 0,
    },
    product_imgs: {
      type: [Object],
      default: [],
    },
    product_category: {
      type: Schema.Types.ObjectId,
      ref: categoryModel,
      default: null,
    },
    product_type: {
      type: String,
      enum: ["Clothe", "Trousers", "Shoes"],
      trim: true,
    },
    product_gender: {
      type: String,
      enum: ["Man", "Woman", "Unisex"],
      trim: true,
    },
    product_brand: {
      type: String,
      default: "",
      trim: true,
    },
    product_price: {
      type: Number,
      default: 0,
    },
    product_slug: {
      type: String,
      slug: "product_name",
      unique: true,
    },
    product_status: {
      type: String,
      enum: ["Draft", "Published", "Scheduled"],
    },
    product_promotions: [{
      type: Schema.Types.ObjectId,
      ref: 'Promotion'
    }]
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Add virtual fields for discount calculation
productSchema.virtual('current_discount').get(function() {
  if (!this.product_promotions || !Array.isArray(this.product_promotions)) return 0;
  
  const now = new Date();
  const activePromotions = this.product_promotions.filter(promo => 
    promo.promotion_start_date <= now && 
    promo.promotion_end_date > now
  );

  return activePromotions.length > 0 
    ? Math.max(...activePromotions.map(p => p.promotion_value))
    : 0;
});

productSchema.virtual('final_price').get(function() {
  return Math.ceil(this.product_price * (1 - this.current_discount / 100));
});

// Ensure virtual fields are included
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = model(DOCUMENT_NAME, productSchema);
