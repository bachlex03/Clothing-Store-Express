"use strict";

const bcrypt = require("bcrypt");
const {
  BadRequestError,
  AuthenticationError,
} = require("../core/error.response");
const {
  findOneByEmail,
  createUser,
  findOneUser,
} = require("../services/user.service");
const User = require("../entities/user.entity");
const { generateTokenPair, decode } = require("../auth/jwt");
const { getInfoObject } = require("../utils/getData");
const sendEmail = require("../mailer/mailer.service");
const RedisService = require("./redis.service");
const { generateMailToken } = require("../auth/jwt");

class AccessService {
  // [GET] /verify?q=
  async verify({ q }) {
    // q is a jwt token
    if (!q) {
      throw new AuthenticationError("Not permitted to access this page");
    }

    const decodedToken = await decode(q);

    if (!decodedToken) {
      throw new AuthenticationError("Not permitted to access this page");
    }

    return { message: "Can send email token" };
  }

  // [GET] /sendMailToken?q=
  async sendMailToken({ q }) {
    // q is a jwt token
    if (!q) {
      throw new AuthenticationError("Not permitted to access this page");
    }

    const decodedToken = await decode(q);

    if (!decodedToken) {
      throw new AuthenticationError("Not permitted to access this page");
    }

    const { email, firstName } = decodedToken;

    const token = await sendEmail({
      to: email,
      name: firstName,
    });

    RedisService.set(`${email}`, token);

    return {
      message: "Sended !",
    };
  }

  // [POST] /verifyEmail
  async verifyEmail({ q, mailToken }) {
    if (!q && !mailToken) {
      throw new BadRequestError("Something went wrong");
    }

    const decodedToken = await decode(q);

    if (!decodedToken) {
      throw new AuthenticationError("Not permitted to access this page");
    }

    // Compare mailToken with token in redis
    const { email } = decodedToken;

    const redisToken = await RedisService.get(`${email}`);

    if (mailToken != redisToken) {
      throw new BadRequestError("Something went wrong");
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

  // [POST] /register
  async register({ firstName = "", lastName = "", email, password }) {
    // 1. checking email exists
    const existedUser = await findOneByEmail(email);

    if (existedUser) {
      throw new BadRequestError("User already registered");
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

    // 4. redirect /verify?q=
    const payload = {
      email: newUser.email,
      firstName: newUser.firstName,
    };

    const token = generateMailToken(payload);

    //5. return page success
    return {
      redirect: "/verify?q=" + token,
    };
  }

  // [POST] /login
  async login({ email = "", password = "" }) {
    // 1. check exist user
    const existUser = await findOneByEmail(email);

    if (!existUser) {
      throw new BadRequestError("User already registered");
    }

    // 2. compare password
    if (!bcrypt.compare(password, existUser.password)) {
      throw new BadRequestError("Wrong password");
    }

    // 3. check is verified
    if (!existUser.verify) {
      const payload = {
        email: existUser.email,
        firstName: existUser.firstName,
      };

      const token = generateMailToken(payload);

      console.log("?q=" + token);

      return {
        redirect: "/verify?q=" + token,
      };
    }

    // 3. generate tokens
    const payload = {
      firstName: existUser.firstName,
      lastName: existUser.lastName,
      email: existUser.email,
      roles: existUser.roles,
    };

    const { accessToken, refreshToken } = generateTokenPair(payload);

    return {
      user: getInfoObject({
        obj: existUser,
        fields: ["firstName", "lastName", "email"],
      }),
      accessToken,
      refreshToken,
    };
  }
}

module.exports = new AccessService();
