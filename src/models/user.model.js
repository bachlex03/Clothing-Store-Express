"use strict";

const { model, Schema } = require("mongoose");

const profileModel = require("./profile.model");

const COLLECTION_NAME = "Users";
const DOCUMENT_NAME = "User";

const userSchema = new Schema(
  {
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
    // roles: {
    //   type: [String],
    //   default: ["USER"],
    //   enum: ["USER", "STAFF", "ADMIN"],
    // },
    roles: {
      type: Schema.Types.ObjectId,
      ref: "Role",
    },
    user_profile: {
      type: Schema.Types.ObjectId,
      ref: profileModel,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, userSchema);
