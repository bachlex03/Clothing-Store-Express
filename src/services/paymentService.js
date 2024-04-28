"use strict";

const {
  BadRequestError,
  AuthenticationError,
} = require("../core/error.response");
const userService = require("./user.service");
const vnpayService = require("../vnpay/vnpay.service.js");
const inventoryService = require("./inventory.service");
const productService = require("./product.service");

const payInvoice = async (req) => {
  // const info = ({
  //   firstName = "",
  //   lastName = "",
  //   phoneNumber = "",
  //   country = "",
  //   province = "",
  //   city = "",
  //   addressLine = "",
  // } = req.body);

  // let { boughtItems, total } = req.body;
  // boughtItems = JSON.parse(boughtItems);

  // // 1. Check if all fields are provided
  // checkInvoiceInfo({ ...info });

  // const verifyTotal = checkTotalPrice(boughtItems);

  // if (total !== verifyTotal) {
  //   throw new BadRequestError("Total price does not match");
  // }

  // 2. Process to payment
  const vnpayUrl = await vnpayService.createPaymentUrl(20000000);

  // 3. async product quantity
  // await inventoryService.reduceQuantity(boughtItems);

  return {
    redirect: vnpayUrl,
  };
};

const checkInvoiceInfo = async ({
  firstName = "",
  lastName = "",
  phoneNumber = "",
  country = "",
  province = "",
  city = "",
  addressLine = "",
}) => {
  // 1. Check if all fields are provided

  const { email } = req.user;

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

  return true;
};

const checkTotalPrice = (boughtItems) => {
  if (!boughtItems || boughtItems.length === 0) {
    throw new BadRequestError("No items available");
  }

  const total = boughtItems.reduce(async (item) => {
    const { slug, size, color, quantity } = item;

    if (!slug || !quantity || !size || !color) {
      throw new BadRequestError("Invalid item information");
    }

    const product = await productService.getBySlug(slug);

    if (!product) {
      throw new BadRequestError("Product not found");
    }

    const { _id } = product;

    const inventory = await inventoryService.getByProductId(_id);

    if (!inventory) {
      throw new BadRequestError("Inventory not found");
    }

    const sku = inventory.find(
      (item) => item.sku.sku_size === size && item.sku.sku_color === color
    );

    if (!sku) {
      throw new BadRequestError("SKU not found");
    }

    const { sku_quantity } = sku;

    if (quantity > sku_quantity) {
      throw new BadRequestError("Not enough quantity");
    }

    total += product.product_price * quantity;
  }, 0);

  return total;
};

const viewDetails = async (params) => {};

const updateAddresses = async (req) => {
  const {
    firstName = "",
    lastName = "",
    phoneNumber = "",
    country = "",
    province = "",
    city = "",
    addressLine = "",
  } = req.body;

  const { email } = req.user;

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

  const user = await userService.updateUserCheckout(email);

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
  updateAddresses,
};
