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
  const {
    firstName = "",
    lastName = "",
    phoneNumber = "",
    country = "",
    province = "",
    city = "",
    addressLine = "",
    note = "",
  } = req.body;

  const { email } = req.user;

  const info = {
    firstName,
    lastName,
    phoneNumber,
    country,
    province,
    city,
    addressLine,
  };

  let { boughtItems = [], totalPrice } = req.body;

  if (boughtItems.length === 0) {
    throw new BadRequestError("No items available");
  }

  try {
    totalPrice = parseInt(totalPrice) * 24000;
  } catch (error) {
    throw new BadRequestError("Invalid total price");
  }

  // 1. Check if all fields are provided
  try {
    const verifyInfo = await checkInvoiceInfo(req, { ...info });
  } catch (error) {
    throw new BadRequestError(error);
  }

  let boughtItemsAttackedId = [];

  try {
    const { totalPrice: verifyTotal, processedItems } =
      await checkTotalPriceAndAttackId(boughtItems);

    boughtItemsAttackedId = processedItems;

    if (totalPrice !== verifyTotal * 24000) {
      throw new BadRequestError("Total price does not match");
    }
  } catch (error) {
    throw new BadRequestError(error);
  }

  const invoiceInfo = {
    invoice_user: email || "",
    invoice_products: boughtItemsAttackedId,
    invoice_note: note,
    invoice_status: "unpaid",
    invoice_total: totalPrice,
  };

  // 2. Process to payment
  const vnpayUrl = await vnpayService.createPaymentUrl(
    totalPrice,
    boughtItemsAttackedId,
    invoiceInfo
  );

  return {
    redirect: vnpayUrl,
  };
};

const checkInvoiceInfo = async (req, info) => {
  // 1. Check if all fields are provided

  const {
    firstName = "",
    lastName = "",
    phoneNumber = "",
    country = "",
    province = "",
    city = "",
    addressLine = "",
  } = info;

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

  const user = await userService.getCheckoutInfo(req);

  const { profile_firstName, profile_lastName, profile_phoneNumber } = user;

  const {
    address_addressLine,
    address_city,
    address_province,
    address_country,
  } = user;

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

const checkTotalPriceAndAttackId = async (boughtItems) => {
  if (!boughtItems || boughtItems.length === 0) {
    throw new BadRequestError("No items available");
  }

  let processedItems = [];

  boughtItems = await Promise.all(
    boughtItems.map(async (item) => {
      const { slug, size, color, quantity, price } = item;

      if (!slug || !quantity || !size || !color || !price) {
        console.log("Invalid item information");
        throw new BadRequestError("Invalid item information");
      }

      const product = await productService.getBySlug({ slug });

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

      processedItems.push({
        _id,
        product_name: product.product_name,
        product_description: product.product_description,
        product_size: size,
        product_color: color,
        product_quantity: quantity,
        product_price: price,
      });
      return item;
    })
  );

  const totalPrice = processedItems.reduce((acc, curr) => {
    return acc + curr.product_price;
  }, 0);

  return {
    totalPrice,
    processedItems,
  };
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
