"use strict";

const {
  BadRequestError,
  AuthenticationError,
} = require("../core/error.response");
const userService = require("./user.service");
const vnpayService = require("../vnpay/vnpay.service.js");

const payInvoice = async (req) => {
  // 1. Check if all fields are provided
  const {
    firstName = "",
    lastName = "",
    phoneNumber = "",
    country = "",
    province = "",
    city = "",
    addressLine = "",
  } = req.body;

  // const { email } = req.user;
  const email = "lov3rinve146@gmail.com";

  if (!email) {
    throw new AuthenticationError("User not found");
  }

  if (
    !firstName ||
    !lastName ||
    !phoneNumber ||
    !country ||
    !province ||
    !city ||
    !addressLine
  ) {
    throw new BadRequestError("All fields are required");
  }

  const user = await userService.findFullInfo(email);
  const profile = user.user_profile;
  const address = profile.profile_address;

  const { profile_firstName, profile_lastName, profile_phoneNumber } = profile;

  const {
    address_addressLine,
    address_city,
    address_province,
    address_country,
  } = address;

  if (
    profile_firstName !== firstName ||
    profile_lastName !== lastName ||
    address_addressLine !== addressLine ||
    address_city !== city ||
    address_province !== province ||
    address_country !== country ||
    phoneNumber !== profile_phoneNumber
  ) {
    throw new BadRequestError("Profile information does not match");
  }

  // 2. Process to payment
  const vnpayUrl = await vnpayService.createPaymentUrl(20000000);

  return {
    redirect: vnpayUrl,
  };
};

const viewDetails = async (params) => {};

const updateAddress = async (req) => {
  const {
    firstName = "",
    lastName = "",
    phoneNumber = "",
    country = "",
    province = "",
    city = "",
    addressLine = "",
  } = req.body;

  // const { email } = req.user;
  const email = "lov3rinve146@gmail.com";

  if (!email) {
    throw new AuthenticationError("User not found");
  }

  if (
    !firstName ||
    !lastName ||
    !addressLine ||
    !city ||
    !province ||
    !country ||
    !phoneNumber
  ) {
    throw new BadRequestError("All fields are required");
  }

  const user = await userService.findFullInfo(email);

  const newProfileObj = {
    profile_firstName: firstName,
    profile_lastName: lastName,
    profile_phoneNumber: phoneNumber,
  };

  const newAddressObj = {
    address_country: country,
    address_province: province,
    address_city: city,
    address_addressLine: addressLine,
  };

  const profile = user.user_profile;
  const address = profile.profile_address;

  // // Update profile fields
  if (profile) {
    // If user has an existing profile, update it
    Object.assign(user.user_profile, newProfileObj);

    await user.user_profile.save();
  }

  if (address) {
    Object.assign(user.user_profile.profile_address, newAddressObj);

    await user.user_profile.profile_address.save();
  }

  // Save changes to the user
  await user.save();

  return user;
};

module.exports = {
  payInvoice,
  viewDetails,
  updateAddress,
};
