// product.controller.js

"use strict";

const productModel = require("../models/product.model");
const inventoryModel = require("../models/inventory.model");

const create = async (body) => {
  const {
    name = "",
    description = "",
    sizes = [],
    color = "",
    price = 0,
    quantity = 0,
  } = body;

  try {
    const product = await productModel.create({
      product_name: name,
      product_description: description,
      product_color: color,
      product_size: sizes[0],
      product_price: price,
    });

    const inventory = await inventoryModel.create({
      inventory_product: product._id,
      inventory_quantity: quantity,
    });

    console.log(inventory);
  } catch (err) {
    console.error(err);
  }

  return;
};

module.exports = {
  create,
};
