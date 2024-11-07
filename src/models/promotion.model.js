const { model, Schema } = require("mongoose");
const COLLECTION_NAME = "Promotions";
const DOCUMENT_NAME = "Promotion";

const promotionSchema = new Schema(
  {
    promotion_name: {
      type: String,
      required: true,
      trim: true,
    },
    promotion_value: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    promotion_start_date: {
      type: Date,
      required: true,
    },
    promotion_end_date: {
      type: Date,
      required: true,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

// Middleware to validate dates
promotionSchema.pre('save', function(next) {
  if (this.promotion_start_date >= this.promotion_end_date) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Virtual field to check if promotion is active
promotionSchema.virtual('is_active').get(function() {
  const now = new Date();
  return this.promotion_start_date <= now && this.promotion_end_date > now;
});

// Ensure virtuals are included in JSON/Object conversions
promotionSchema.set('toJSON', { virtuals: true });
promotionSchema.set('toObject', { virtuals: true });

module.exports = model(DOCUMENT_NAME, promotionSchema); 