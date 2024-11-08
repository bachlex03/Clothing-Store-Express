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
    product_promotion: {
      type: {
        promotion_id: {
          type: Schema.Types.ObjectId,
          ref: 'Promotion'
        },
        current_discount: {
          type: Number,
          min: 0,
          max: 100
        },
        start_date: Date,
        end_date: Date
      },
      default: null
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Add virtual fields for discount calculation
productSchema.virtual('current_discount').get(function() {
  if (!this.product_promotion) return 0;
  
  const now = new Date();
  if (this.product_promotion.start_date <= now && 
      this.product_promotion.end_date > now) {
    return this.product_promotion.current_discount;
  }
  return 0;
});

productSchema.virtual('final_price').get(function() {
  const discount = this.current_discount || 0;
  return Math.ceil(this.product_price * (1 - discount / 100));
});

// Ensure virtual fields are included
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = model(DOCUMENT_NAME, productSchema);
