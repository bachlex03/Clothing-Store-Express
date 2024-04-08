const { Schema } = require("mongoose");
const { BadRequestError } = require("../core/error.response");
const inventoryModel = require("../models/inventory.model");

const create = async ({
  productId = null,
  size = "",
  color = "",
  quantity = 0,
}) => {
  if (!productId) {
    throw new BadRequestError("Product ID is required");
  }

  console.log({
    productId,
  });

  const filters = {
    inventory_product: productId,
    "sku.sku_size": size,
    "sku.sku_color": color,
  };

  const update = {
    sku: {
      sku_quantity: quantity,
      sku_size: size,
      sku_color: color,
    },
  };

  const opts = {
    upsert: true,
    new: true,
  };

  try {
    const inventory = inventoryModel.findOneAndUpdate(filters, update, opts);

    return inventory;
  } catch (err) {
    console.error(err);
  }

  return null;
};

const getByProductId = async (productId, filters = {}) => {
  if (productId === Schema.Types.ObjectId) {
    throw new BadRequestError("Something wrong with product ID");
  }

  try {
    const inventory = await inventoryModel.find(
      {
        inventory_product: productId,
      },
      filters
    );

    console.log(inventory);

    return inventory;
  } catch (err) {
    console.error(err);
  }

  return null;
};

module.exports = {
  create,
  getByProductId,
};
