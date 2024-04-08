"use strict";

const productModel = require("../models/product.model");
const categoryService = require("../services/category.service");
const inventoryService = require("../services/inventory.service");
const Database = require("../db/mongo.config");

const create = async (body) => {
  const {
    name = "",
    description = "",
    sizes = [],
    color = "",
    price = 0,
    quantity = 0,
  } = body;

  if (!name) {
    throw new BadRequestError("Product name is required");
  }

  if (!color) {
    throw new BadRequestError("Product name is required");
  }

  if (sizes.length == 0) {
    throw new BadRequestError("Product sizes is required");
  }

  if (quantity < 0) {
    throw new BadRequestError("quantity must be greater than 0");
  }

  const mongo = await Database.getInstance();

  let session = await mongo.startSession();

  try {
    session.startTransaction();

    const product = await productModel.create({
      product_name: name,
      product_description: description,
      product_color: color,
      product_size: sizes[0],
      product_price: price,
    });

    await inventoryService.create({
      productId: product._id,
      quantity: quantity,
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

module.exports = {
  create,
};
