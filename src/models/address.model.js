const { model, Schema } = require("mongoose");

const COLLECTION_NAME = "Addresses";
const DOCUMENT_NAME = "address";

const addressSchema = new Schema(
  {},
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, addressSchema);
