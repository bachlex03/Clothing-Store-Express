"use strict";

const {
  BadRequestError,
  AuthenticationError,
} = require("../core/error.response");
const userService = require("./user.service");
const Profile = require("../models/profile.model");
const Address = require("../models/address.model");

const payInvoice = async (req) => {
  const {
    firstName = "",
    lastName = "",
    addressLine = "",
    city = "",
    province = "",
    country = "",
  } = req.body;

  const { email } = req.user;

  console.log({
    body: req.body,
  });

  console.log({
    user: req.user,
  });

  if (!email) {
    throw new AuthenticationError("User not found");
  }

  const user = await userService.findOneByEmail(email);
  const profile = user.populate({
    path: "user_profile",
    populate: {
      path: "profile_address",
      model: "Address",
    },
  });
  // const address = profile.profile_address;

  console.log({
    user,
    profile,
    address,
  });

  if (
    !firstName ||
    !lastName ||
    !addressLine ||
    !city ||
    !province ||
    !country
  ) {
    throw new BadRequestError("All fields are required");
  }
};

const viewDetails = async (params) => {};

module.exports = {
  payInvoice,
  viewDetails,
};
