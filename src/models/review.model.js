const { model, Schema } = require("mongoose");

const COLLECTION_NAME = "Reviews";
const DOCUMENT_NAME = "Review";

const reviewSchema = new Schema(
    {
        review_user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        review_product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        review_invoice: {
            type: Schema.Types.ObjectId,
            ref: "Invoice",
            required: true,
        },
        review_date: {
            type: Date,
            required: true,
        },
        review_rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        review_content: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

reviewSchema.index({ review_user: 1, review_product: 1, review_invoice: 1 }, { unique: true });

module.exports = model(DOCUMENT_NAME, reviewSchema);
