"use strict";

const { BadRequestError } = require("../core/error.response");
const userModel = require("../models/user.model");

const payInvoice = async (req) => {
  const {
    firstName = "",
    lastName = "",
    addressLine = "",
    city = "",
    region = "",
  } = req.body;

  const { email } = req.user;

  if (!firstName || !lastName || !addressLine || !city || !region) {
    throw new BadRequestError("All fields are required");
  }
};

const viewDetails = async (params) => {};

module.exports = {};
