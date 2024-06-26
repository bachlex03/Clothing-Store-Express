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
  },
  {
    Timestamp: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, productSchema);
