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

const getAllInvoices = async ({ page = 1, limit = 10 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const invoices = await invoiceModel.find()
    .populate({
      path: 'invoice_user',
      select: 'email user_profile',
      populate: {
        path: 'user_profile',
        select: 'profile_firstName profile_lastName profile_phoneNumber profile_address',
        populate: {
          path: 'profile_address',
          select: 'address_country address_province address_district address_addressLine'
        }
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean()
    .exec();

  const total = await invoiceModel.countDocuments();

  return {
    invoices,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }
  };
};

module.exports = {
  create,
  getByUserEmail,
  getAllInvoices,
};
