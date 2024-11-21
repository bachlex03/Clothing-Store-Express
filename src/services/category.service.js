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

const update = async (id, body) => {
  const { name, parentId } = body;

  if (!id) {
    throw new BadRequestError("Invalid category id");
  }

  const category = await categoryModel.findById(id);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  category.category_name = name;
  category.category_parentId = parentId;

  await category.save();

  return category;
};

const remove = async (id) => {
  if (!id) {
    throw new BadRequestError("Invalid category id");
  }

  const category = await categoryModel.findByIdAndDelete(id);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return !!category;
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

  if (!slug) {
    throw new BadRequestError("Invalid category slug");
  }

  // Tìm category hiện tại
  const currentCategory = await categoryModel.findOne({ category_slug: slug });
  if (!currentCategory) {
    throw new BadRequestError("Category not found");
  }

  // Tìm tất cả category con
  const childCategories = await categoryModel.find({
    category_parentId: currentCategory._id,
  });

  // Tạo mảng chứa id của category hiện tại và các category con
  const categoryIds = [currentCategory._id];
  childCategories.forEach((child) => {
    categoryIds.push(child._id);
  });

  // Lấy sản phẩm từ tất cả categories và populate thông tin category
  const products = await productModel
    .find({
      product_category: { $in: categoryIds },
    })
    .populate({
      path: "product_category",
      select: "category_name category_slug",
    });

  return products;
};

module.exports = {
  create,
  getAll,
  withChildren,
  getProductsByCategory,
  update,
  remove,
};
