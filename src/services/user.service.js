"use strict";

const { BadRequestError } = require("../core/error.response");
const userModel = require("../models/user.model");

const findOneByEmail = (email) => {
  const user = userModel.findOne({ email });

  return user;
};

const createUser = async ({ firstName, lastName, email, password }) => {
  try {
    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      password,
    });

    return newUser;
  } catch (err) {
    throw new BadRequestError(err);
  }
};

module.exports = {
  findOneByEmail,
  createUser,
};
