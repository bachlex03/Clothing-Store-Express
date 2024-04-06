"use strict";

const bcrypt = require("bcrypt");
const {
  BadRequestError,
  AuthenticationError,
} = require("../core/error.response");
const { findOneByEmail, createUser } = require("../services/user.service");
const User = require("../entities/user.entity");
const { generateTokenPair, decode } = require("../auth/jwt");
const { getInfoObject } = require("../utils/getData");
const sendEmail = require("../mailer/mailer.service");
const { TOO_MANY_REQUESTS } = require("../utils/http.code/statusCodes");

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

    // 4. send email
    await sendEmail({
      to: newUser.email,
      name: newUser.firstName,
    });

    //5. return page success
    return "/success-register";
  }

  async login() {
    return {
      token: "Random token",
    };
  }

  async verify({ q }) {
    // q is a jwt token
    if (!q) {
      throw new AuthenticationError("Not permitted to access this page");
    }

    const decodedToken = await decode(q);

    if (!decodedToken) {
      throw new AuthenticationError("Not permitted to access this page");
    }

    return {};
  }

  async verifyEmail({ q, mailToken }) {
    if (!q && !mailToken) {
      throw new BadRequestError("Something went wrong");
    }

    const decodedToken = await decode(q);

    if (!decodedToken) {
      throw new AuthenticationError("Not permitted to access this page");
    }

    const { email, token } = decodedToken;

    if (!bcrypt.compare(mailToken, token)) {
      throw new BadRequestError("Wrong token");
    }

    const user = await findOneByEmail(email);
    await user.updateOne({ verify: true });

    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
    };

    const { accessToken, refreshToken } = generateTokenPair(payload);

    return {
      user: getInfoObject({
        obj: user,
        fields: ["firstName", "lastName", "email"],
      }),
      accessToken,
      refreshToken,
    };
  }
}

module.exports = new AccessService();
