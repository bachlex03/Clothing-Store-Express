"use strict";

const { BadRequestError } = require("../core/error.response");
const userModel = require("../models/user.model");

const findOneByEmail = async (email) => {
  const user = await userModel.findOne({ email });

  return user;
};

const findOneUser = async (email, password) => {
  const user = await userModel.findOne({ email, password });

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

const updatePassword = async (email, password) => {
  try {
    const user = await userModel.findOneAndUpdate(
      {
        email: email,
      },
      {
        password: password,
      }
    );

    return user;
  } catch (err) {
    console.log(err);
  }

  return null;
};

module.exports = {
  findOneByEmail,
  createUser,
  findOneUser,
  updatePassword,
};
