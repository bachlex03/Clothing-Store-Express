const { model, Schema } = require("mongoose");

const COLLECTION_NAME = "Profile";
const DOCUMENT_NAME = "profile";

const profileSchema = new Schema(
  {
    profile_address: {
      type: Schema.Types.ObjectId,
      ref: "Addresses",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, profileSchema);
