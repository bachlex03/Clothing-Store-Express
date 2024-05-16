"use strict";

const productModel = require("../models/product.model");
const inventoryService = require("../services/inventory.service");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const Database = require("../db/mongo.config");
const {
  sizesEnum,
  colorsEnum,
  statusEnum,
  GenderEnum,
  genderArr,
} = require("../common/enum");
const generateProductCode = require("../utils/generate-product-code");
const cloundinaryService = require("../cloundinary/cloundService");
const { deleteFile } = require("../utils/handle-os-file");
const { getValueObj } = require("../utils/getValueObj");
const Product = require("../entities/product.entity");

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

  // console.log("req.body", req.body);

  images = req.files;

  // generate product code
  const code = generateProductCode({ brand, category: category, gender });

  // Starting create product
  const product = new Product();

  product
    .setName(name)
    .setDescription(description)
    .setQuantity(quantity)
    .setPrice(price)
    .setCode(code)
    .setStatus(status)
    .setColor(color)
    .setSizes(sizes)
    .setCategory(categoryId)
    .setType(type)
    .setGender(gender)
    .setImages(images);

  const isValid = validateInfo(product);

  if (!isValid) {
    throw new BadRequestError("Something went wrong when create product!");
  }

  let saveImages = [];

  if (product.images) {
    for (let i = 0; i < product.images.length; i++) {
      const result = await cloundinaryService.uploadImage(
        product.images[i].path
      );

      saveImages.push(result);

      deleteFile(product.images[i].path);
    }
  }

  const mongo = Database.getInstance();

  const products = product.sizes.map(async (size, index) => {
    const update = {
      product_code: product.code,
      product_name: product.name,
      product_description: product.description,
      product_type: product.type,
      product_gender: product.gender,
      product_brand: product.brand,
      product_category: product.category,
      $addToSet: {
        product_colors: product.color,
        product_sizes: size,
      },
      $inc: {
        product_stocks: parseInt(product.quantity),
      },
      product_price: product.price,
      product_imgs: saveImages ? saveImages : [],
      product_status: product.status,
    };

    const filters = {
      product_slug: product.name.trim().toLowerCase().replace(/ /g, "-"),
    };

    const opts = {
      upsert: true,
      new: true,
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
      session.endSession();

      return product;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      saveImages.forEach(async (image) => {
        const response = await cloundinaryService.deleteImage(image.public_id);
      });

      throw new BadRequestError(err.message);
    }
  });

  return Promise.all(products);
};

// [GET] /api/v1/products
const getAll = async () => {
  const products = await productModel.find().populate("product_category");

  console.log("products", products);

  return products;
};

// [GET] /api/v1/products/:slug
const getBySlug = async (params) => {
  const { slug } = params;

  let product = await productModel
    .findOne({ product_slug: slug })
    .populate("product_category");

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

// [GET] /api/v1/products?q=
const getByQueryParam = async (query) => {
  if (query.q === "min") {
    const products = await productModel.find().populate("product_category");

    if (!products) {
      throw new NotFoundError("Products not found");
    }
    let results = [];

    results = products.map((product) => {
      let data = getValueObj({
        obj: product,
        fields: [
          "product_code",
          "product_name",
          "product_price",
          "product_imgs",
          "product_category",
          "product_brand",
          "product_slug",
          "product_status",
          "product_stocks",
          "product_sizes",
          "product_colors",
          "product_type",
        ],
      });

      if (data.product_category) {
        data.product_category = getValueObj({
          obj: data.product_category,
          fields: ["category_name", "category_slug"],
        });
      }

      if (data.product_imgs) {
        data.product_imgs = data.product_imgs.map((img) => {
          let imgs = getValueObj({
            obj: img,
            fields: ["public_id", "secure_url", "original_filename", "bytes"],
          });

          return imgs;
        });
      }

      return data;
    });

    return results;
  } else if (query.q === "full") {
    return "testing...";
  }

  if (!products) {
    throw new NotFoundError("Products not found");
  }

  return products;
};

const validateInfo = (product = Product) => {
  console.log("product", product);
  //Check if product name is empty
  if (!product.name) {
    throw new BadRequestError("Product name is required");
  }

  // Check if colors is empty or not in colorsEnum
  if (!product.sizes.length > 0) {
    throw new BadRequestError("Size is required");
  } else {
    if (typeof product.sizes === "string") {
      product.sizes = product.sizes.split(",");
    }

    product.sizes.forEach((size) => {
      if (!sizesEnum.includes(size)) {
        throw new BadRequestError("Invalid size value");
      }
    });
  }

  // Check if color is empty or not in sizesEnum
  if (!product.color || !colorsEnum.includes(product.color)) {
    throw new BadRequestError("Invalid color value");
  }

  // Check if product quantity is less than 0
  if (product.quantity < 0) {
    throw new BadRequestError("quantity must be greater than 0");
  }

  // Check status value
  if (!statusEnum.includes(product.status)) {
    product.status = DEFAULT_STATUS;
  }

  // Check status value
  if (!genderArr.includes(product.gender)) {
    product.gender = GenderEnum.UNISEX;
  }

  return true;
};

module.exports = {
  create,
  getAll,
  getBySlug,
  getImages,
  getByQueryParam,
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
