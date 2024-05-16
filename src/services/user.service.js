"use strict";

const { BadRequestError } = require("../core/error.response");
const Database = require("../db/mongo.config");
const userModel = require("../models/user.model");
const profileModel = require("../models/profile.model");
const addressModel = require("../models/address.model");
const InvoiceModel = require("../models/invoice.model");
const { getValueObj } = require("../utils/getValueObj");
const bcrypt = require("bcrypt");

const findOneByEmail = async (email) => {
  const user = await userModel.findOne({ email }).lean().exec();

  return user;
};

const findOneUser = async (email, password) => {
  const user = await userModel.findOne({ email, password });

  return user;
};

const getCheckoutInfo = async ({ email }) => {
  if (!email) {
    throw new BadRequestError("Email not found");
  }

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
      "address_district",
      "address_province",
      "address_country",
    ],
  });

  return { ...profile, ...address };
};

const updateCheckoutInfo = async (req) => {
  const {
    firstName = "",
    lastName = "",
    phoneNumber = "",
    country = "",
    province = "",
    district = "",
    addressLine = "",
  } = req.body;

  const { email } = req.user;

  if (
    !firstName ||
    !lastName ||
    !addressLine ||
    !district ||
    !province ||
    !country ||
    !phoneNumber
  ) {
    throw new BadRequestError("All fields are required");
  }

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

  const newProfileObj = {
    profile_firstName: firstName,
    profile_lastName: lastName,
    profile_phoneNumber: phoneNumber,
  };

  const newAddressObj = {
    address_country: country,
    address_province: province,
    address_district: district,
    address_addressLine: addressLine,
  };

  const profile = user.user_profile;
  const address = profile.profile_address;

  const mongo = Database.getInstance();
  let session = await mongo.startSession();

  try {
    // // Update profile fields
    if (profile) {
      session.startTransaction();

      // If user has an existing profile, update it
      Object.assign(user.user_profile, newProfileObj);

      await user.user_profile.save();
    }

    if (address) {
      Object.assign(user.user_profile.profile_address, newAddressObj);

      await user.user_profile.profile_address.save();
    }

    // Save changes to the user
    await user.save();

    await session.commitTransaction();

    session.endSession();
  } catch (err) {
    await session.abortTransaction();

    session.endSession();
    throw new BadRequestError(err);
  } finally {
  }

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

  const data = getValueObj({
    obj: user.user_profile,
    fields: ["profile_firstName", "profile_lastName", "profile_phoneNumber"],
  });

  return {
    email,
    ...data,
  };
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
      "address_district",
      "address_province",
      "address_country",
    ],
  });
};

const updateAddresses = async (req) => {
  const { addressLine, district, province, country } = req.body;

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
    address_country: country,
    address_province: province,
    address_district: district,
    address_addressLine: addressLine,
  };

  const address = user.user_profile.profile_address;

  Object.assign(address, newAddress);

  await address.save();

  return getValueObj({
    obj: address,
    fields: [
      "address_country",
      "address_province",
      "address_district",
      "address_addressLine",
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

const changeCurrentPassword = async (req) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const { email } = req.user;

  if (newPassword !== confirmPassword) {
    throw new BadRequestError("Password not match");
  }

  const user = await findOneByEmail(email);

  if (!user) {
    throw new BadRequestError("User not found");
  }

  // compare password
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw new BadRequestError("Password not match");
  }

  const hashPassword = await bcrypt.hash(confirmPassword, 10);

  try {
    const user = await userModel.findOneAndUpdate(
      {
        email: email,
      },
      {
        password: hashPassword,
      }
    );

    return !!user;
  } catch (err) {
    console.log(err);
  }

  return false;
};

module.exports = {
  findOneByEmail,
  createUser,
  findOneUser,
  updatePassword,
  getCheckoutInfo,
  getProfile,
  getAddress,
  updateAddresses,
  updateProfile,
  getInvoices,
  updateVerify,
  findOneAuth,
  updatePassword,
  changeCurrentPassword,
  updateCheckoutInfo,
};
