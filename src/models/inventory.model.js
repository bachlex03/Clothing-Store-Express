const { model, Schema } = require("mongoose");

const COLLECTION_NAME = "Inventory";
const DOCUMENT_NAME = "inventory";

const skuSchema = new Schema(
  {
    sku_size: {
      type: String,
      enum: ["S", "M", "L", "XL"],
      required: true,
    },
    sku_color: {
      type: String,
      enum: ["Yellow", "Red", "Brown", "Gray", "Pink", "White"],
      required: true,
    },
    sku_quantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const inventorySchema = new Schema(
  {
    inventory_product: {
      type: Schema.Types.ObjectId,
      ref: "Products",
      required: true,
      index: true,
    },
    sku: {
      type: skuSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, inventorySchema);
