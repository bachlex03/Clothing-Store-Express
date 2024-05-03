"use strict";

const { BadRequestError } = require("../core/error.response");
const invoiceModel = require("../models/invoice.model");
const userService = require("./user.service");

const create = async ({
  userEmail,
  status,
  note = "",
  total,
  boughtProducts = [],
}) => {
  if (!userEmail) {
    throw new BadRequestError("User email is required");
  }

  if (!status) {
    throw new BadRequestError("Status is required");
  }

  if (!total) {
    throw new BadRequestError("Total is required");
  }

  if (!boughtProducts.length) {
    throw new BadRequestError("Bought products is required");
  }

  const { _id } = await userService.findOneByEmail(userEmail);

  const invoice = invoiceModel.create({
    invoice_user: _id,
    invoice_products: [...boughtProducts],
    invoice_note: note,
    invoice_status: status,
    invoice_total: total,
  });

  if (!invoice) {
    throw new BadRequestError("Invoice not created");
  }

  return invoice;
};

module.exports = {
  create,
};

// invoice_product;
// product_name;
// product_description;
// product_size;
// product_color;
// product_quantity;
// product_price;

// invoice_user;
// invoice_products;
// invoice_note;
// invoice_status;
// invoice_total;
