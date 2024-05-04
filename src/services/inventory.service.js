const { Schema } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const inventoryModel = require("../models/inventory.model");
const productModel = require("../models/product.model");

const create = async ({
  productId = null,
  size = "",
  color = "",
  quantity = 0,
}) => {
  if (!productId) {
    throw new BadRequestError("Product ID is required");
  }

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
  console.log("items", items);

  for (const item of items) {
    let { _id, product_size, product_color, product_quantity } = item;

    if (!_id || !product_size || !product_color || !product_quantity) {
      throw new BadRequestError("Missing product information");
    }

    const product = await productModel.findOne({ _id });

    product.product_stocks -= product_quantity;

    console.log("product_quantity", product_quantity);
    console.log("product.product_stocks", product.product_stocks);

    await product.save();

    const filters = {
      inventory_product: _id,
      "sku.sku_size": product_size,
      "sku.sku_color": product_color,
    };

    const update = {
      $inc: {
        "sku.sku_quantity": -product_quantity,
      },
    };

    console.log("product.product_stocks", -product_quantity);

    const opts = {
      new: true,
      upsert: true,
    };

    try {
      await inventoryModel.findOneAndUpdate(filters, update, opts);
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
