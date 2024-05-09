const { model, Schema } = require("mongoose");

const COLLECTION_NAME = "Resources";
const DOCUMENT_NAME = "Resource";

const resourceSchema = new Schema(
  {
    res_name: {
      type: String,
      required: true,
      trim: true,
    },
    res_description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, resourceSchema);
