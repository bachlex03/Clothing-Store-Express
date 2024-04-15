"use strict";

const productModel = require("../models/product.model");
const categoryService = require("../services/category.service");
const inventoryService = require("../services/inventory.service");
const { getInfoObject } = require("../utils/getData");
const { BadRequestError } = require("../core/error.response");
const Database = require("../db/mongo.config");
const { sizesEnum, colorsEnum } = require("../common/enum");

// [POST] /api/v1/products
const create = async (req) => {
  let {
    name = "",
    description = "",
    sizes = [],
    color = "",
    type = "",
    gender = "",
    brand = "",
    categoryId = null,
    price = 0,
    quantity = 0,
    images = [],
  } = req.body;

  images = req.files;

  console.log({
    body: req.body,
  });

  // Check if product name is empty
  if (!name) {
    throw new BadRequestError("Product name is required");
  }

  // Check if colors is empty or not in colorsEnum
  if (!sizes.length > 0) {
    throw new BadRequestError("Size is required");
  } else {
    sizes.forEach((size) => {
      if (!sizesEnum.includes(size)) {
        throw new BadRequestError("Invalid size value");
      }
    });
  }

  // Check if sizes is empty or not in sizesEnum
  if (!color || !colorsEnum.includes(color)) {
    throw new BadRequestError("Invalid color value");
  }

  // Check if product quantity is less than 0
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

  const mongo = await Database.getInstance();

  const products = sizes.map(async (size) => {
    const update = {
      product_name: name,
      product_description: description,
      product_type: type,
      product_gender: gender,
      product_brand: brand,
      product_category: categoryId,
      $addToSet: {
        product_colors: color,
        product_sizes: size,
      },
      product_price: price,
      product_imgs: images ? images : [],
    };

    let session = await mongo.startSession();

    try {
      session.startTransaction();

      const product = await productModel.findOneAndUpdate(
        filters,
        update,
        opts
      );

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

      session.endSession();

      return;
    }
  });

  return products;
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

  const filtersInventory = {
    "sku.sku_size": 1,
    "sku.sku_color": 1,
    "sku.sku_quantity": 1,
    _id: 0,
  };

  const productInventory = await inventoryService.getByProductId(
    product._id,
    filtersInventory
  );

  const flat = productInventory.map((item) => {
    var { sku } = item.toObject();
    return {
      ...sku,
    };
  });

  const result = { ...product.toObject(), skus: [...flat] };

  return result;
};

// [GET] /api/v1/products/:slug/images
const getImages = async (params) => {
  const { slug } = params;

  let product = await productModel.findOne({
    product_slug: slug,
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const images = product.product_imgs;

  return images;
};

module.exports = {
  create,
  getAll,
  getBySlug,
  getImages,
};

// images = imagesUpload.map((image) => {
//   let img = fs.readFileSync(image.path);
//   let encode_image = img.toString("base64");

//   let final = {
//     contentType: image.mimetype,
//     image: Buffer.from(encode_image, "base64"),
//   };

//   return final;
// });
