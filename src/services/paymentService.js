"use strict";

const {
  BadRequestError,
  AuthenticationError,
} = require("../core/error.response");
const userService = require("./user.service");

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
  const profile = user.user_profile;
  const address = profile.profile_address;

  console.log({
    profile,
    address,
  });

  if (!firstName || !lastName || !addressLine || !city || !region) {
    throw new BadRequestError("All fields are required");
  }
};

const viewDetails = async (params) => {};

module.exports = {
  payInvoice,
  viewDetails,
};
