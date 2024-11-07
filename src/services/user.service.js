"use strict";

const { BadRequestError } = require("../core/error.response");
const Database = require("../db/mongo.config");
const userModel = require("../models/user.model");
const profileModel = require("../models/profile.model");
const addressModel = require("../models/address.model");
const InvoiceModel = require("../models/invoice.model");
const { getValueObj } = require("../utils/getValueObj");
const productModel = require("../models/product.model");
const bcrypt = require("bcrypt");
const reviewModel = require("../models/review.model");

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

  const user = await userModel
    .findOne({ email })
    .populate({
      path: "user_profile",
      model: "profile",
    })
    .lean()
    .exec();

  if (!user) {
    throw new BadRequestError("User or profile not found");
  }

  const results = await InvoiceModel.find({ invoice_user: user._id })
    .lean()
    .exec();

  if (results.length === 0) {
    return [];
  }

  const processedResults = await Promise.all(
    results.map(async (invoice) => {
      const { profile_firstName, profile_lastName } = user.user_profile || {};
      const products = await Promise.all(
        invoice.invoice_products.map(async (product) => {
          const dbProduct = await productModel
            .findById(product._id)
            .lean()
            .exec();
          if (!dbProduct) {
            throw new Error(`Product not found for ID: ${product._id}`);
          }
          return { ...product, slug: dbProduct.product_slug };
        })
      );
      return {
        ...getValueObj({
          obj: invoice,
          fields: [
            "_id",
            "createdAt",
            "invoice_status",
            "invoice_total",
            "invoice_products",
          ],
        }),
        invoice_fullname: `${profile_firstName || ""} ${profile_lastName || ""
          }`,
        invoice_products: products,
      };
    })
  );

  return processedResults;
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

const createBusinessAccount = async (req) => {
  const { email, password, firstName, lastName, phoneNumber, role } = req.body;

  console.log({ email, password, firstName, lastName, phoneNumber, role });

  if (!email || !password || !firstName || !lastName || !phoneNumber || !role) {
    throw new BadRequestError("All fields are required");
  }

  const user = await findOneByEmail(email);

  if (user) {
    throw new BadRequestError("User already exists");
  }

  const filter = {
    email,
  };

  const update = {
    email,
    password,
    roles: [role],
  };

  const opts = {
    upsert: true,
    new: true,
  };

  const address = await addressModel.create({});
  const profile = await profileModel.create({
    profile_firstName: firstName,
    profile_lastName: lastName,
    profile_phoneNumber: phoneNumber,
    profile_address: address._id,
  });

  const account = await userModel.create({
    email,
    password,
    roles: [role],
    verified: true,
    user_profile: profile._id,
  });

  return account;
};

const getMember = async (req) => {
  const users = await userModel
    .find({
      roles: { $ne: ["66434d1afd0d76dfa0eee8af"] },
    })
    .populate("roles")
    .populate("user_profile")
    .lean();

  return users;
};

const getInvoiceReviews = async (req) => {
  const { orderId } = req.query;
  const { email } = req.user;

  if (!orderId) {
    throw new BadRequestError("orderId is required");
  }

  const user = await userModel.findOne({ email }).lean().exec();

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const invoice = await InvoiceModel.findOne({
    _id: orderId,
    invoice_user: user._id,
  }).lean().exec();

  if (!invoice) {
    throw new BadRequestError("Invoice not found");
  }

  const productIds = invoice.invoice_products.map(product => product._id);

  const products = await productModel.find({
    _id: { $in: productIds },
  }).populate('product_category').lean().exec();

  const reviews = await reviewModel.find({
    review_invoice: orderId,
    review_product: { $in: productIds },
  }).populate({
    path: 'review_user',
    populate: {
      path: 'user_profile',
      model: 'profile'
    }
  }).lean().exec();

  const invoice_products = products.map(product => {
    const invoiceProduct = invoice.invoice_products.find(p => p._id.toString() === product._id.toString());
    const review = reviews.find(r => r.review_product.toString() === product._id.toString());

    return {
      _id: product._id,
      product_name: product.product_name,
      product_size: invoiceProduct.product_size,
      product_color: invoiceProduct.product_color,
      product_image: product.product_imgs[0]?.secure_url || null,
      product_category_name: product.product_category?.category_name || null,
      product_review: review ? {
        review_id: review._id,
        review_date: review.createdAt,
        review_user: `${review.review_user.user_profile.profile_firstName} ${review.review_user.user_profile.profile_lastName}`,
        review_rating: review.review_rating,
        review_content: review.review_content
      } : null
    };
  });

  return {
    invoice_id: invoice._id,
    invoice_products
  };
};

const addProductReview = async (req) => {
  const { order_id, product_id, review_date, review_rating, review_content } = req.body;
  const { email } = req.user;

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new BadRequestError("User not found");
  }

  const userId = user._id;

  const invoice = await InvoiceModel.findOne({
    _id: order_id,
    invoice_user: userId,
    'invoice_products._id': product_id
  });

  if (!invoice) {
    throw new BadRequestError("Invoice not found or product not in this invoice");
  }

  const existingReview = await reviewModel.findOne({
    review_user: userId,
    review_product: product_id,
    review_invoice: order_id
  });

  if (existingReview) {
    throw new BadRequestError("You have already reviewed this product for this order");
  }

  const newReview = await reviewModel.create({
    review_user: userId,
    review_product: product_id,
    review_invoice: order_id,
    review_rating,
    review_content
  });

  return {
    review_id: newReview._id,
    review_rating: newReview.review_rating,
    review_content: newReview.review_content,
    review_date: newReview.createdAt
  }
};

const updateProductReview = async (req) => {
  const { review_id, review_rating, review_content } = req.body;
  const { email } = req.user;

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new BadRequestError("User not found");
  }

  const review = await reviewModel.findOne({
    _id: review_id,
    review_user: user._id
  });

  if (!review) {
    throw new BadRequestError("Review not found or unauthorized");
  }

  review.review_rating = review_rating;
  review.review_content = review_content;

  await review.save();

  return {
    review_id: review._id,
    review_rating: review.review_rating,
    review_content: review.review_content,
    review_date: review.createdAt
  };
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
  createBusinessAccount,
  getMember,
  getInvoiceReviews,
  addProductReview,
  updateProductReview,
};
