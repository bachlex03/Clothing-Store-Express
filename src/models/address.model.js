const { model, Schema } = require("mongoose");

const COLLECTION_NAME = "Addresses";
const DOCUMENT_NAME = "address";

const addressSchema = new Schema(
  {
    address_country: {
      type: String,
      default: "",
      trim: true,
    },
    address_province: {
      type: String,
      default: "",
      trim: true,
    },
    address_city: {
      type: String,
      default: "",
      trim: true,
    },
    address_addressLine: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, addressSchema);
