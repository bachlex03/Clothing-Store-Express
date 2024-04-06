"use strict";

const bcrypt = require("bcrypt");
const { BadRequestError } = require("../core/error.response");
const { findOneByEmail, createUser } = require("../services/user.service");
const User = require("../entities/user.entity");
const { generateTokenPair } = require("../auth/jwt");
const { getInfoObject } = require("../utils/getData");
const sendEmail = require("../mailer/mailer.service");

class AccessService {
  async register({ firstName = "", lastName = "", email, password }) {
    // 1. checking email exists
    const existedUser = findOneByEmail(email);

    if (!existedUser) {
      throw new BadRequestError();
    }

    // 2. hashing password
    const HashPassword = await bcrypt.hash(password, 10);

    // 3. insert
    const user = new User();
    user
      .setEmail(email)
      .setPassword(HashPassword)
      .setFirstName(firstName)
      .setLastName(lastName);

    const newUser = await createUser(user.getInstance());

    // 4. generate tokens
    // const payload = {
    //   firstName: newUser.firstName,
    //   lastName: newUser.lastName,
    //   email: newUser.email,
    //   roles: newUser.roles,
    // };

    // const { accessToken, refreshToken } = generateTokenPair(payload);

    // 5. send email
    const mailToken = await sendEmail({
      to: newUser.email,
      name: newUser.firstName,
    });

    return mailToken;

    // return {
    //   user: getInfoObject({
    //     obj: newUser,
    //     fields: ["firstName", "lastName", "email"],
    //   }),
    //   accessToken,
    //   refreshToken,
    // };
  }

  async login() {
    return {
      token: "Random token",
    };
  }

  async verifyEmail({}) {}
}

module.exports = new AccessService();
