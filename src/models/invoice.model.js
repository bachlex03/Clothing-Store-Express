const { model, Schema } = require("mongoose");
const userModel = require("./user.model");

const COLLECTION_NAME = "Invoices";
const DOCUMENT_NAME = "invoice";

const productInvoiceSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    ref: "Products",
    required: true,
    index: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  product_description: {
    type: String,
    required: true,
  },
  product_size: {
    type: [String],
    enum: ["S", "M", "L", "XL", "2XL"],
    required: true,
  },
  product_color: {
    type: [String],
    enum: ["Yellow", "Red", "Brown", "Gray", "Pink", "White"],
    required: true,
  },
  product_quantity: {
    type: Number,
    required: true,
  },
  product_price: {
    type: String,
    required: true,
    trim: true,
  },
});

const invoiceSchema = new Schema(
  {
    invoice_user: {
      type: Schema.Types.ObjectId,
      ref: userModel,
      required: true,
    },
    invoice_products: {
      type: [productInvoiceSchema],
      required: true,
    },
    invoice_note: {
      type: String,
      default: "",
      trim: true,
    },
    invoice_status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
      required: true,
    },
    invoice_total: {
      type: Number,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, invoiceSchema);
