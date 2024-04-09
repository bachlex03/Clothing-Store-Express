"use strict";

const { BadRequestError } = require("../core/error.response");
const Database = require("../db/mongo.config");
const userModel = require("../models/user.model");
const profileModel = require("../models/profile.model");
const addressModel = require("../models/address.model");

const findOneByEmail = async (email) => {
  const user = await userModel.findOne({ email }).populate("user_profile");

  return user;
};

const findOneUser = async (email, password) => {
  const user = await userModel.findOne({ email, password });

  return user;
};

const findFullInfo = async (email) => {
  const user = await userModel.findOne({ email }).populate({
    path: "user_profile",
    model: "profile",
    populate: {
      path: "profile_address",
      model: "address",
    },
  });

  return user;
};

const createUser = async ({
  firstName = "",
  lastName = "",
  email,
  password,
}) => {
  const mongo = await Database.getInstance();
  let session = await mongo.startSession();

  try {
    session.startTransaction();

    const address = await addressModel.create({});

    const profile = await profileModel.create({
      profile_firstName: firstName,
      profile_lastName: lastName,
      profile_address: address._id,
    });

    const newUser = await userModel.create({
      email,
      password,
      user_profile: profile._id,
    });

    await session.commitTransaction();

    return newUser;
  } catch (err) {
    await session.abortTransaction();

    throw new BadRequestError(err);
  } finally {
    session.endSession();
  }

  return null;
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
  findFullInfo,
};
