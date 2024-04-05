"use strict";

const bcrypt = require("bcrypt");
const { BadRequestError } = require("../core/error.response");
const { findOneByEmail, createUser } = require("../services/user.service");
const User = require("../entities/user.entity");
const { generateTokenPair } = require("../auth/jwt");
const { getInfoObject } = require("../utils/getData");

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
    if (newUser) {
      const payload = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        roles: newUser.roles,
      };

      const { accessToken, refreshToken } = generateTokenPair(payload);

      return {
        user: getInfoObject({
          obj: newUser,
          fields: ["firstName", "lastName", "email"],
        }),
        accessToken,
        refreshToken,
      };
    }

    return newUser;
  }

  async login() {
    return {
      token: "Random token",
    };
  }
}

module.exports = new AccessService();
