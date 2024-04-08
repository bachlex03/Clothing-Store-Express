"use strict";

const { model, Schema } = require("mongoose");
const mongoose = require("mongoose");
var slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const COLLECTION_NAME = "Products";
const DOCUMENT_NAME = "Product";

const productSchema = new Schema(
  {
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
      enum: ["S", "M", "L", "XL"],
      required: true,
    },
    product_colors: {
      type: [String],
      enum: ["Yellow", "Red", "Brown", "Gray", "Pink", "White"],
      required: true,
    },
    product_imgs: {
      type: [String],
      default: [""],
    },
    // product_category: {
    //   type: [Schema.Types.ObjectId],
    // },
    product_type: {
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
  },
  {
    Timestamp: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, productSchema);
