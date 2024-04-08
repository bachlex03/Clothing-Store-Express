"use strict";

const { model, Schema } = require("mongoose");

const COLLECTION_NAME = "Users";
const DOCUMENT_NAME = "User";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      default: "",
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    verified: {
      type: Schema.Types.Boolean,
      default: false,
    },
    roles: {
      type: [String],
      default: ["USER"],
      enum: ["USER", "STAFF", "ADMIN"],
    },
    user_profile: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, userSchema);
