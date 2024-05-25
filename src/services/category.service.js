"use strict";

const { Schema } = require("mongoose");
const { BadRequestError } = require("../core/error.response");
const categoryModel = require("../models/category.model");
const productModel = require("../models/product.model");

const create = async (body) => {
  let { name = "", parentId = null } = body;

  try {
    const category = await categoryModel.create({
      category_name: name,
      category_parentId: parentId,
    });

    return category;
  } catch (err) {
    console.error(err);
  }

  return null;
};

const getAll = async () => {
  try {
    const categories = await categoryModel.find(
      {},
      {
        category_name: 1,
        category_parentId: 1,
        category_slug: 1,
      }
    );

    return categories;
  } catch (err) {
    console.error(err);
  }

  return null;
};

const withChildren = async () => {
  try {
    const categories = await categoryModel.aggregate([
      {
        $match: {
          category_parentId: null,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "category_parentId",
          as: "children",
        },
      },
      {
        $addFields: {
          childrenDebug: "$children",
        },
      },
      {
        $project: {
          _id: 0,
          parent: "$category_name",
          children: {
            $map: {
              input: "$children",
              as: "child",
              in: "$$child.category_name",
            },
          },
        },
      },
    ]);

    console.log(JSON.stringify(categories, null, 2)); // Log intermediate results

    return categories;
  } catch (err) {
    console.error(err);
  }

  return null;
};

const getProductsByCategory = async (params) => {
  const { slug } = params;

  console.log("slug", slug);

  if (!slug) {
    throw new BadRequestError("Invalid category slug");
  }

  const category = await categoryModel.findOne({ category_slug: slug });

  if (!category) {
    throw new BadRequestError("Category not found");
  }

  const products = await productModel.find({
    product_category: category._id,
  });

  return products;
};

module.exports = {
  create,
  getAll,
  withChildren,
  getProductsByCategory,
};
