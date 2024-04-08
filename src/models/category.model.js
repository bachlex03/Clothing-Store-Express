const { model, Schema } = require("mongoose");

const COLLECTION_NAME = "Categories";
const DOCUMENT_NAME = "Category";

const categorySchema = new Schema(
  {
    category_name: {
      type: String,
      empty: false,
    },
    category_parentId: {
      type: Schema.Types.ObjectId,
      ref: "Categories",
      default: null,
    },
    category_slug: {
      type: String,
      slug: "category_name",
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, categorySchema);
