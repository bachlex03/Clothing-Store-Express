"use strict";

const { BadRequestError } = require("../core/error.response");
const Database = require("../db/mongo.config");
const userModel = require("../models/user.model");
const profileModel = require("../models/profile.model");
const addressModel = require("../models/address.model");
const InvoiceModel = require("../models/invoice.model");
const { getValueObj } = require("../utils/getValueObj");

const findOneByEmail = async (email) => {
  const user = await userModel.findOne({ email }).lean().exec();

  return user;
};

const findOneUser = async (email, password) => {
  const user = await userModel.findOne({ email, password });

  return user;
};

const getCheckoutInfo = async (req) => {
  const { email } = req.user;

  if (!email) {
    throw new BadRequestError("User not found");
  }

  const user = await userModel.findOne({ email }).populate({
    path: "user_profile",
    model: "profile",
    populate: {
      path: "profile_address",
      model: "address",
    },
  });

  let profile = user.user_profile;
  let address = profile.profile_address;

  profile = getValueObj({
    obj: profile,
    fields: ["profile_firstName", "profile_lastName", "profile_phoneNumber"],
  });

  address = getValueObj({
    obj: address,
    fields: [
      "address_addressLine",
      "address_city",
      "address_province",
      "address_country",
    ],
  });

  return { ...profile, ...address };
};

const updateUserCheckout = async (email) => {
  if (!email) {
    throw new BadRequestError("User not found");
  }

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

const getProfile = async (req) => {
  const { email } = req.user;

  const user = await userModel.findOne({ email }).populate({
    path: "user_profile",
    model: "profile",
  });

  if (!user) {
    throw new BadRequestError("User not found");
  }

  return getValueObj({
    obj: user.user_profile,
    fields: ["profile_firstName", "profile_lastName", "profile_phoneNumber"],
  });
};

const getAddress = async (req) => {
  const { email } = req.user;

  const user = await userModel.findOne({ email }).populate({
    path: "user_profile",
    model: "profile",
    populate: {
      path: "profile_address",
      model: "address",
    },
  });

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const address = user.user_profile.profile_address;

  return getValueObj({
    obj: address,
    fields: [
      "address_addressLine",
      "address_city",
      "address_province",
      "address_country",
    ],
  });
};

const updateAddresses = async (req) => {
  const { addressLine, city, province, country } = req.body;

  const { email } = req.user;

  const user = await userModel.findOne({ email }).populate({
    path: "user_profile",
    model: "profile",
    populate: {
      path: "profile_address",
      model: "address",
    },
  });

  const newAddress = {
    address_addressLine: addressLine,
    address_city: city,
    address_province: province,
    address_country: country,
  };

  const address = user.user_profile.profile_address;

  Object.assign(address, newAddress);

  await address.save();

  return getValueObj({
    obj: address,
    fields: [
      "address_addressLine",
      "address_city",
      "address_province",
      "address_country",
    ],
  });
};

const updateProfile = async (req) => {
  const { email } = req.user;

  const { firstName = "", lastName = "", phoneNumber = "" } = req.body;

  const user = await userModel.findOne({ email }).populate({
    path: "user_profile",
    model: "profile",
  });

  const newProfile = {
    profile_firstName: firstName,
    profile_lastName: lastName,
    profile_phoneNumber: phoneNumber,
  };

  const profile = user.user_profile;

  Object.assign(profile, newProfile);

  await profile.save();

  return getValueObj({
    obj: profile,
    fields: ["profile_firstName", "profile_lastName", "profile_phoneNumber"],
  });
};

const createUser = async ({
  firstName = "",
  lastName = "",
  email,
  password,
}) => {
  const mongo = Database.getInstance();
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

const getInvoices = async (req) => {
  const { email } = req.user;

  const user = await findOneByEmail(email);

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const results = await InvoiceModel.find({ invoice_user: user._id })
    .lean()
    .exec();

  if (results.length === 0) {
    return [];
  }

  return getValueObj({
    obj: results,
    fields: ["invoice_status", "invoice_total", "invoice_products"],
  });
};

const updateVerify = async (email) => {
  try {
    const user = await userModel.findOneAndUpdate(
      {
        email: email,
      },
      {
        verified: true,
      }
    );

    return user;
  } catch (err) {
    console.log(err);
  }

  return null;
};

const findOneAuth = async (email) => {
  const user = await userModel.findOne({ email }).populate("roles").lean();

  return user;
};

module.exports = {
  findOneByEmail,
  createUser,
  findOneUser,
  updatePassword,
  getCheckoutInfo,
  getProfile,
  getAddress,
  updateUserCheckout,
  updateAddresses,
  updateProfile,
  getInvoices,
  updateVerify,
  findOneAuth,
};
