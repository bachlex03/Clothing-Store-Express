const { Schema } = require("mongoose");
const { BadRequestError } = require("../core/error.response");
const inventoryModel = require("../models/inventory.model");

const create = async ({ productId = null, quantity = 0 }) => {
  if (!productId) {
    throw new BadRequestError("Product ID is required");
  }

  try {
    const inventory = inventoryModel.create({
      inventory_product: productId,
      inventory_quantity: quantity,
    });

    return inventory;
  } catch (err) {
    console.error(err);
  }

  return null;
};

module.exports = {
  create,
};
