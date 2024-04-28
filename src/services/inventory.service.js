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

const reduceQuantity = async (items = []) => {
  for (const item of items) {
    const { productId, size, color, quantity } = item;

    if (!productId || !size || !color || !quantity) {
      throw new BadRequestError("Missing product information");
    }

    const filters = {
      inventory_product: productId,
      "sku.sku_size": size,
      "sku.sku_color": color,
    };

    const update = {
      $inc: {
        "sku.sku_quantity": -quantity,
      },
    };

    const opts = {
      new: true,
    };

    try {
      inventoryModel.findOneAndUpdate(filters, update, opts);
    } catch (err) {
      throw new BadRequestError(err);
    }
  }

  return null;
};

const getAll = async () => {
  const inventory = await inventoryModel.find();

  if (!inventory) {
    throw new NotFoundError("Inventory not found");
  }

  return inventory;
};

const getAllAndGroupByProductId = async () => {
  const inventory = await inventoryModel.aggregate([
    {
      $group: {
        _id: "$inventory_product",
        inventory: {
          $push: "$$ROOT",
        },
      },
    },
  ]);

  if (!inventory) {
    throw new NotFoundError("Inventory not found");
  }

  return inventory;
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
  getAll,
  getAllAndGroupByProductId,
  reduceQuantity,
};
