"use strict";

const productModel = require("../models/product.model");
const categoryService = require("../services/category.service");
const inventoryService = require("../services/inventory.service");
const { getInfoObject } = require("../utils/getData");
const { BadRequestError } = require("../core/error.response");
const Database = require("../db/mongo.config");
const { sizesEnum, colorsEnum, statusEnum } = require("../common/enum");
const generateProductCode = require("../utils/generate-product-code");
const cloundinaryService = require("../cloundinary/cloundService");
const { deleteFile } = require("../utils/handle-os-file");

const DEFAULT_STATUS = "Draft";

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
    category = "",
    price = 0,
    quantity = 0,
    images = [],
    status = "Draft",
  } = req.body;

  images = req.files;

  // console.log({
  //   body: req.body,
  // });

  // const assetsResult = await cloundinaryService.uploadImage(
  //   "https://static1.squarespace.com/static/656f4e4dababbd7c042c4946/657236350931ee4538eea52c/65baf15103d8ad2826032a8a/1707422532886/how-to-stop-being-a-people-pleaser-1_1.jpg?format=1500w"
  // );

  // console.log(assetsResult);

  // cloundinaryService.deleteImage("how-to-stop-being-a-people-pleaser-1_1");

  // Check if product name is empty
  if (!name) {
    throw new BadRequestError("Product name is required");
  }

  // Check if colors is empty or not in colorsEnum
  if (!sizes.length > 0) {
    throw new BadRequestError("Size is required");
  } else {
    if (typeof sizes === "string") {
      sizes = sizes.split(",");
    }
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

  // Check status value
  if (!statusEnum.includes(status)) {
    status = DEFAULT_STATUS;
  }

  const code = generateProductCode({ brand, category: category, gender });

  const filters = {
    product_slug: name.trim().toLowerCase().replace(/ /g, "-"),
  };

  const opts = {
    upsert: true,
    new: true,
  };

  let saveImages = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloundinaryService.uploadImage(images[i].path);

    saveImages.push(result);

    deleteFile(images[i].path);
  }

  const mongo = Database.getInstance();
  let session = await mongo.startSession();

  const products = sizes.map(async (size) => {
    const update = {
      product_code: code,
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
      product_imgs: saveImages ? saveImages : [],
      product_status: status,
    };

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
    } catch (err) {
      await session.abortTransaction();

      console.error(err);

      session.endSession();

      saveImages.forEach(async (image) => {
        const response = await cloundinaryService.deleteImage(image.public_id);
      });

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
