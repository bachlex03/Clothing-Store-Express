"use strict";

const { BadRequestError } = require("../core/error.response");
const userModel = require("../models/user.model");

const findOneByEmail = (email) => {
  const user = userModel.findOne({ email });

  return user;
};

const createUser = async ({ firstName, lastName, email, password }) => {
  const newUser = await userModel.create({
    firstName,
    lastName,
    email,
    password,
  });

  if (!newUser) {
    throw new BadRequestError("Couldn't create user");
  }

  return newUser;
};

module.exports = {
  findOneByEmail,
  createUser,
};
