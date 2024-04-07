const { model, Schema } = require("mongoose");
const { Sizes } = require("../common/constant");

const COLLECTION_NAME = "Inventory";
const DOCUMENT_NAME = "inventory";

const inventorySchema = new Schema(
  {
    inventory_product: {
      type: Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
    inventory_quantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, inventorySchema);
