"use strict";

const productModel = require("../models/product.model");
const categoryService = require("../services/category.service");
const inventoryService = require("../services/inventory.service");
const { getInfoObject } = require("../utils/getData");
const { BadRequestError } = require("../core/error.response");
const Database = require("../db/mongo.config");

// [POST] /api/v1/products
const create = async (body) => {
  const {
    name = "",
    description = "",
    size = "",
    color = "",
    price = 0,
    quantity = 0,
  } = body;

  if (!name) {
    throw new BadRequestError("Product name is required");
  }

  if (!size || !["S", "M", "L", "XL"].includes(size)) {
    throw new BadRequestError("Invalid size value");
  }

  if (
    !color ||
    !["Yellow", "Red", "Brown", "Gray", "Pink", "White"].includes(color)
  ) {
    throw new BadRequestError("Invalid color value");
  }

  if (quantity < 0) {
    throw new BadRequestError("quantity must be greater than 0");
  }

  const filters = {
    product_slug: name.trim().toLowerCase().replace(/ /g, "-"),
  };

  const opts = {
    upsert: true,
    new: true,
  };

  const update = {
    product_name: name,
    product_description: description,
    $addToSet: {
      product_colors: color,
      product_sizes: size,
    },
    product_price: price,
  };

  const mongo = await Database.getInstance();
  let session = await mongo.startSession();

  try {
    session.startTransaction();

    const product = await productModel.findOneAndUpdate(filters, update, opts);

    await inventoryService.create({
      productId: product._id,
      quantity: quantity,
      size: size,
      color: color,
    });

    await session.commitTransaction();

    return product;
  } catch (err) {
    await session.abortTransaction();

    console.error(err);
  } finally {
    session.endSession();
  }

  return null;
};

// [GET] /api/v1/products
const getAll = async () => {
  const products = await productModel.find();

  if (!products) {
    throw new NotFoundError("Products not found");
  }

  return products;
};

// [GET] /api/v1/products/:slug
const getBySlug = async (params) => {
  const { slug } = params;

  let product = await productModel.findOne({ product_slug: slug });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const productInventory = await inventoryService.getByProductId(product._id);

  const { product_quantity } = productInventory;

  const result = { ...product.toObject(), product_quantity };

  return result;
};

module.exports = {
  create,
  getAll,
  getBySlug,
};
