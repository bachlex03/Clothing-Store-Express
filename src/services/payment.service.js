"use strict";

const {
  BadRequestError,
  AuthenticationError,
} = require("../core/error.response.js");
const userService = require("./user.service.js");
const vnpayService = require("../vnpay/vnpay.service.js");
const inventoryService = require("./inventory.service.js");
const productService = require("./product.service.js");

const payInvoice = async (req) => {
  const {
    firstName = "",
    lastName = "",
    phoneNumber = "",
    country = "",
    province = "",
    district = "",
    addressLine = "",
    note = "",
  } = req.body;

  let { boughtItems = [], totalPrice } = req.body;

  const { email } = req.user;

  const info = {
    firstName,
    lastName,
    phoneNumber,
    country,
    province,
    district,
    addressLine,
  };

  if (boughtItems.length === 0) {
    throw new BadRequestError("No items available");
  }

  try {
    totalPrice = parseInt(totalPrice) * 24000;
  } catch (error) {
    throw new BadRequestError("Invalid total price");
  }

  try {
    await checkInvoiceInfo(req, { ...info });
  } catch (error) {
    throw new BadRequestError(error);
  }

  let boughtItemsAttackedId = [];

  try {
    const { totalPrice: verifyTotal, processedProducts } =
      await checkTotalPriceAndAttackId(boughtItems);

    boughtItemsAttackedId = processedProducts;

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
    url: vnpayUrl,
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
    district = "",
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
    !district ||
    !addressLine
  ) {
    throw new BadRequestError("All fields are required");
  }

  const user = await userService.getCheckoutInfo(req);

  const { profile_firstName, profile_lastName, profile_phoneNumber } = user;

  const {
    address_addressLine,
    address_district,
    address_province,
    address_country,
  } = user;

  if (
    profile_firstName !== firstName ||
    profile_lastName !== lastName ||
    address_addressLine !== addressLine ||
    address_district !== district ||
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

  let boughtItemsAttackedId = await Promise.all(
    boughtItems.map(async (item) => {
      const { slug, size, color, quantity, price } = item;

      if (!slug || !quantity || !size || !color || !price) {
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

      const inventorySku = inventory.find(
        (item) => item.sku.sku_size === size && item.sku.sku_color === color
      );

      if (!inventorySku) {
        throw new BadRequestError("Type of product not found");
      }

      const sku_quantity = inventorySku.sku.sku_quantity;

      if (quantity > sku_quantity) {
        throw new BadRequestError("Not enough inventory quantity");
      }

      return {
        _id,
        product_name: product.product_name,
        product_description: product.product_description,
        product_size: size,
        product_color: color,
        product_quantity: quantity,
        product_price: price,
      };
    })
  );

  const totalPrice = boughtItemsAttackedId.reduce((acc, curr) => {
    return acc + curr.product_price;
  }, 0);

  return {
    totalPrice,
    processedProducts: boughtItemsAttackedId,
  };
};

const viewDetails = async (params) => {};

module.exports = {
  payInvoice,
  viewDetails,
};
