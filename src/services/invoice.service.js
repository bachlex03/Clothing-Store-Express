"use strict";

const { BadRequestError } = require("../core/error.response");
const invoiceModel = require("../models/invoice.model");
const userModel = require("../models/user.model");
const userService = require("./user.service");

const create = async ({
  user_id,
  status,
  note = "",
  total,
  boughtProducts = [],
}) => {
  if (!user_id) {
    throw new BadRequestError("Invalid user id");
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

  const invoice = invoiceModel.create({
    invoice_user: user_id,
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

const getByUserEmail = async (email) => {
  const user = await userModel.findOne({ email }).lean().exec();

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const invoices = await invoiceModel
    .findOne({ invoice_user: user._id })
    .lean()
    .exec();

  if (!invoices) {
    return [];
  }

  return invoices;
};

module.exports = {
  create,
  getByUserEmail,
};
