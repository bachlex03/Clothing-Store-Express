"use strict";

const e = require("express");
const { model, Schema } = require("mongoose");

const COLLECTION_NAME = "Roles";
const DOCUMENT_NAME = "Role";

const roleSchema = new Schema(
  {
    role_name: {
      type: String,
      required: true,
      trim: true,
      enum: ["ADMIN", "USER"],
      unique: true,
    },
    role_description: {
      type: String,
      trim: true,
      default: "",
    },
    role_grants: [
      {
        resource: {
          type: Schema.Types.ObjectId,
          ref: "Resource",
          required: true,
        },
        actions: {
          type: Array,
          required: true,
        },
        attributes: {
          type: String,
          default: "*",
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, roleSchema);
