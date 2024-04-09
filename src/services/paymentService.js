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

  // const { email } = req.user;
  const email = "lov3rinve146@gmail.com";

  if (!email) {
    throw new AuthenticationError("User not found");
  }

  const user = await userService.findFullInfo(email);
  const profile = user.user_profile;
  const address = profile.profile_address;

  const { profile_firstName, profile_lastName, profile_phoneNumber } = profile;

  const {
    address_addressLine,
    address_city,
    address_provide,
    address_country,
  } = address;

  if (
    profile_firstName !== firstName ||
    profile_lastName !== lastName ||
    address_addressLine !== addressLine ||
    address_city !== city ||
    address_provide !== province ||
    address_country !== country
  ) {
    throw new BadRequestError("Profile information does not match");
  }
};

const viewDetails = async (params) => {};

module.exports = {
  payInvoice,
  viewDetails,
};
