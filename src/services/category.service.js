"use strict";

const { Schema } = require("mongoose");
const { BadRequestError } = require("../core/error.response");
const categoryModel = require("../models/category.model");

const create = async (body) => {
  let { name = "", parentId = null } = body;

  if (parentId !== Schema.Types.ObjectId) {
    parentId = null;
  }

  if (!name) {
    throw new BadRequestError("Category name is required");
  }

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
    const categories = await categoryModel.find();

    return categories;
  } catch (err) {
    console.error(err);
  }

  return null;
};

const getAllChildren = async () => {
  try {
    const categories = await categoryModel.find({
      category_parentId: null,
    });

    return categories;
  } catch (err) {
    console.error(err);
  }

  return null;
};

module.exports = {
  create,
  getAll,
  getAllChildren,
};
