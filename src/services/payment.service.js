"use strict";

const {
  BadRequestError,
  AuthenticationError,
} = require("../core/error.response.js");
const userService = require("./user.service.js");
const vnpayService = require("../vnpay/vnpay.service.js");
const inventoryService = require("./inventory.service.js");
const productService = require("./product.service.js");
const Invoice = require("../entities/invoice.entity.js");
const invoiceService = require("../services/invoice.service");

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

  const { email } = req.user;

  let { boughtItems = [], totalPrice } = req.body;

  const info = {
    firstName,
    lastName,
    phoneNumber,
    country,
    province,
    district,
    addressLine,
  };

  // Validate bought items
  if (boughtItems.length === 0) {
    throw new BadRequestError("No items available");
  }

  try {
    totalPrice = parseInt(totalPrice) * 25000;
  } catch (error) {
    throw new BadRequestError("Invalid total price");
  }

  // check user
  const user = await userService.findOneByEmail(email);

  if (!user) {
    throw new AuthenticationError("User not found");
  }

  // Validate checkout information
  const isInfoValid = await checkInvoiceInfo(email, info);

  if (!isInfoValid) {
    throw new BadRequestError("Invalid checkout information");
  }

  // Validate price and attack id to bought items
  let boughtItemsAttackedId = [];

  try {
    const { totalPrice: verifyTotal, processedProducts } =
      await checkTotalPriceAndAttackId(boughtItems);

    console.log("verifyTotal", verifyTotal);
    console.log("totalPrice", totalPrice);

    boughtItemsAttackedId = processedProducts;

    if (totalPrice !== verifyTotal * 25000) {
      throw new BadRequestError("Total price does not match");
    }
  } catch (error) {
    throw new BadRequestError(error);
  }

  // Create invoice
  const invoice = new Invoice();

  invoice
    .setUser(user._id)
    .setProducts(boughtItemsAttackedId)
    .setNote(note)
    .setStatus("unpaid")
    .setTotal(totalPrice);

  console.log("invoice", invoice.getInstance());

  console.log("invoice", invoice.user);

  // 2. Process to payment
  const vnpayUrl = await vnpayService.createPaymentUrl(
    totalPrice,
    boughtItemsAttackedId,
    invoice
  );

  return {
    url: vnpayUrl,
  };
};

const payInvoiceCash = async (req) => {
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

  const { email } = req.user;

  let { boughtItems = [], totalPrice } = req.body;

  const info = {
    firstName,
    lastName,
    phoneNumber,
    country,
    province,
    district,
    addressLine,
  };

  // Validate bought items
  if (boughtItems.length === 0) {
    throw new BadRequestError("No items available");
  }

  try {
    totalPrice = parseInt(totalPrice) * 25000;
  } catch (error) {
    throw new BadRequestError("Invalid total price");
  }

  // check user
  const user = await userService.findOneByEmail(email);

  if (!user) {
    throw new AuthenticationError("User not found");
  }

  // Validate checkout information
  const isInfoValid = await checkInvoiceInfo(email, info);

  if (!isInfoValid) {
    throw new BadRequestError("Invalid checkout information");
  }

  // Validate price and attack id to bought items
  let boughtItemsAttackedId = [];

  try {
    const { totalPrice: verifyTotal, processedProducts } =
      await checkTotalPriceAndAttackId(boughtItems);

    console.log("verifyTotal", verifyTotal);
    console.log("totalPrice", totalPrice);

    boughtItemsAttackedId = processedProducts;

    if (totalPrice !== verifyTotal * 25000) {
      throw new BadRequestError("Total price does not match");
    }
  } catch (error) {
    throw new BadRequestError(error);
  }

  // Create invoice
  const invoice = new Invoice();

  invoice
    .setUser(user._id)
    .setProducts(boughtItemsAttackedId)
    .setNote(note)
    .setStatus("unpaid")
    .setTotal(totalPrice);

  console.log("invoice", invoice.getInstance());

  console.log("invoice", invoice.user);

  const response = await invoiceService.create({
    user_id: invoice.user,
    status: invoice.status,
    total: invoice.total,
    boughtProducts: invoice.products,
    note: invoice.note,
  });

  if (!invoice) {
    throw new BadRequestError("Invoice not created");
  }

  return invoice;
};

const checkInvoiceInfo = async (email, info) => {
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

  if (!email) {
    return false;
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
    return false;
  }

  const checkoutInfo = await userService.getCheckoutInfo({ email });

  if (!checkoutInfo) {
    return false;
  }

  const { profile_firstName, profile_lastName, profile_phoneNumber } =
    checkoutInfo;

  const {
    address_addressLine,
    address_district,
    address_province,
    address_country,
  } = checkoutInfo;

  if (
    profile_firstName !== firstName ||
    profile_lastName !== lastName ||
    address_addressLine !== addressLine ||
    address_district !== district ||
    address_province !== province ||
    address_country !== country ||
    phoneNumber !== profile_phoneNumber
  ) {
    return false;
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
    return acc + curr.product_price * curr.product_quantity;
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
  payInvoiceCash,
};
