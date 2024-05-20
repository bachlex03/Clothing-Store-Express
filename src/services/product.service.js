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
    name,
    description,
    sizes = [],
    color,
    type,
    gender,
    brand,
    categoryId = null,
    category,
    price,
    quantity,
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
    .setBrand(brand)
    .setImages(images);

  // Validate fields
  try {
    validateInfo(product);
  } catch (err) {
    throw new BadRequestError(err.message);
  }

  let saveImages = [];

  // Upload images to cloundinary
  if (product.images) {
    for (let i = 0; i < product.images.length; i++) {
      const result = await cloundinaryService.uploadImage(
        product.images[i].path
      );

      saveImages.push(result);

      deleteFile(product.images[i].path);
    }
  }

  // Start transaction
  const mongo = Database.getInstance();
  let session = await mongo.startSession();

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

      // saveImages.forEach(async (image) => {
      //   const response = await cloundinaryService.deleteImage(image.public_id);
      // });

      throw new BadRequestError(err.message);
    }
  });

  return Promise.all(products);
};

// [DELETE] /api/v1/products/:id
const remove = async (id) => {
  if (!id) throw new BadRequestError("Product id is required");

  const product = await productModel.findByIdAndDelete(id);

  if (!product) {
    throw new NotFoundError("Can't delete this product");
  }

  return !!product;
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

// [GET] /api/v1/products?q=
const getBySearchQuery = async (query) => {
  const { q } = query;

  if (!q) {
    return [];
  }

  const products = await productModel
    .find({
      product_name: { $regex: q, $options: "i" },
      product_slug: { $regex: q, $options: "i" },
    })
    .populate("product_category");

  return products;
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
          "_id",
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

  if (!results) {
    throw new NotFoundError("Products not found");
  }

  return results;
};

const validateInfo = (product = Product) => {
  console.log("product", product);
  //Check if product name is empty
  if (!product.name) {
    throw new BadRequestError("Product name is required");
  }

  // Check if product description is empty
  if (!product.description) {
    throw new BadRequestError("Product description is required");
  }

  // Check if product quantity is empty
  if (!product.price) {
    throw new BadRequestError("Product price is required");
  }

  try {
    product.price = parseInt(product.price);
  } catch (err) {
    throw new BadRequestError("Price must be a number");
  }

  console.log("product.price", product.price);

  // Check if product quantity is empty
  if (!(product.price > 0)) {
    throw new BadRequestError("Price must be greater than 0");
  }

  // Check if product type is empty
  if (!product.type) {
    throw new BadRequestError("Product type is required");
  }

  // Check if product type is empty
  if (!product.brand) {
    throw new BadRequestError("Product type is required");
  }

  // Check if product category is empty
  if (!product.category) {
    throw new BadRequestError("Product category is required");
  }

  // Check if colors is empty or not in colorsEnum
  if (!product.sizes.length > 0) {
    throw new BadRequestError("Product size is required");
  }

  // Check if sizes not in sizesEnum
  if (typeof product.sizes === "string") {
    product.sizes = product.sizes.split(",");

    product.sizes.forEach((size) => {
      if (!sizesEnum.includes(size)) {
        throw new BadRequestError("Invalid size value");
      }
    });
  }

  // Check if color is empty or not in sizesEnum
  if (!product.color) {
    throw new BadRequestError("Product color is required");
  }

  // Check if color not in colorsEnum
  if (!colorsEnum.includes(product.color)) {
    throw new BadRequestError("Invalid color value");
  }

  // Check if product quantity is empty
  if (!product.quantity) {
    throw new BadRequestError("Product quantity is required");
  }

  try {
    product.quantity = parseInt(product.quantity);
  } catch (err) {
    throw new BadRequestError("Quantity must be a number");
  }

  console.log("product.quantity", product.quantity);
  // Check if product quantity is less than 0
  if (!(product.quantity > 0)) {
    throw new BadRequestError("quantity must be greater than 0");
  }

  // Check if product status is empty
  if (!product.status) {
    throw new BadRequestError("Product status is required");
  }

  // Check if product status is empty
  if (!product.gender) {
    throw new BadRequestError("Product gender is required");
  }

  // Check if product status is empty
  if (!product.images) {
    throw new BadRequestError("Product images is required");
  }

  // Check if product status is empty
  if (!product.images.length > 0) {
    throw new BadRequestError("Product images is required");
  }

  // // Check status value
  // if (!statusEnum.includes(product.status)) {
  //   product.status = DEFAULT_STATUS;
  // }

  // // Check status value
  // if (!genderArr.includes(product.gender)) {
  //   product.gender = GenderEnum.UNISEX;
  // }

  return true;
};

module.exports = {
  create,
  getAll,
  getBySlug,
  getImages,
  getByQueryParam,
  remove,
  getBySearchQuery,
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
