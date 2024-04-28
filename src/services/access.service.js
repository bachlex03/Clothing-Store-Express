"use strict";

const bcrypt = require("bcrypt");
const cryptoRandomString = import("crypto-random-string");
const {
  BadRequestError,
  AuthenticationError,
  NotFoundError,
} = require("../core/error.response");
const {
  findOneByEmail,
  createUser,
  updatePassword,
} = require("../services/user.service");
const User = require("../entities/user.entity");
const { generateTokenPair, decode, generateMailToken } = require("../auth/jwt");
const { getValueObj } = require("../utils/getValueObj");
const { sendEmail, sendResetPassword } = require("../mailer/mailer.service");
const RedisService = require("./redis.service");

class AccessService {
  // [GET] /verify?q=
  async verify({ q }) {
    // q is a jwt token
    if (!q) {
      throw new AuthenticationError("Not permitted to access");
    }

    const decodedToken = decode(q);

    if (!decodedToken) {
      throw new AuthenticationError("Not permitted to access");
    }

    const { verified } = decodedToken;

    if (verified) {
      throw new AuthenticationError(
        "Your are verified or not permitted to access"
      );
    }

    return null;
  }

  // [GET] /sendMailToken?q=
  async sendMailToken({ q }) {
    // q is a jwt token
    if (!q) {
      throw new AuthenticationError("Not permitted to access");
    }

    const decodedToken = await decode(q);

    if (!decodedToken) {
      throw new AuthenticationError("Not permitted to access");
    }

    const { email, firstName } = decodedToken;

    const token = await sendEmail({
      to: email,
      name: firstName,
    });

    console.log({
      email,
      token,
    });

    RedisService.set(`${email}:token`, token);

    return {
      message: "Sended !",
    };
  }

  // [POST] /verifyEmail
  async verifyEmail({ q, mailToken }) {
    console.log({
      q,
      mailToken,
    });

    if (!q && !mailToken) {
      throw new BadRequestError("Something went wrong");
    }

    const decodedToken = await decode(q);

    if (!decodedToken) {
      throw new AuthenticationError("Not permitted to access");
    }

    // Compare mailToken with token in redis
    const { email } = decodedToken;

    const redisToken = await RedisService.get(`${email}:token`);

    if (mailToken != redisToken) {
      throw new BadRequestError("Something went wrong");
    }

    await RedisService.del(`${email}:token`);

    const user = await findOneByEmail(email);
    await user.updateOne({ verified: true });

    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
    };

    const { accessToken, refreshToken } = generateTokenPair(payload);

    return {
      user: getValueObj({
        obj: user,
        fields: ["firstName", "lastName", "email"],
      }),
      accessToken,
      refreshToken,
    };
  }

  // [POST] /auth/register
  async register(body) {
    const { firstName = "", lastName = "", email, password } = body;

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

    if (!newUser) {
      throw new BadRequestError("Something went wrong");
    }

    // 4. redirect /verify?q=
    const payload = {
      email: newUser.email,
      firstName: newUser.firstName,
      verified: newUser.verified,
    };

    const token = generateMailToken(payload);

    //5. return page success
    return {
      redirect: "/verify?q=" + token,
    };
  }

  // [POST] /login
  async login({ email = "", password = "" }, res) {
    // 1. check exist user
    const existUser = await findOneByEmail(email);

    if (!existUser) {
      throw new BadRequestError("Not found");
    }

    // 2. compare password
    const isMatch = await bcrypt.compare(password, existUser.password);
    if (!isMatch) {
      throw new BadRequestError("Wrong password");
    }

    // 3. check is verified
    if (!existUser.verified) {
      const payload = {
        email: existUser.email,
        firstName: existUser.firstName,
        verified: existUser.verify,
      };

      const token = generateMailToken(payload);

      console.log("?q=" + token);

      return {
        redirect: "/verify?q=" + token,
      };
    }

    console.log("login success", existUser);

    // 3. generate tokens
    const payload = {
      firstName: existUser.firstName,
      lastName: existUser.lastName,
      email: existUser.email,
      roles: existUser.roles,
    };

    const { accessToken, refreshToken } = generateTokenPair(payload);

    return {
      user: getValueObj({
        obj: existUser,
        fields: ["firstName", "lastName", "email"],
      }),
      accessToken,
      refreshToken,
    };
  }

  // [POST] /recover
  async recover(body) {
    const { email } = body;

    // 3. generate tokens
    const payload = {
      email,
    };

    const token = generateMailToken(payload);

    const resetUrl = `${process.env.REACT_URL}/reset-password?q=${token}`;

    sendResetPassword({
      to: email,
      resetUrl: resetUrl,
    });

    return {
      message: "Sended to your email!",
      redirect: resetUrl,
    };
  }

  async resetPassword(req) {
    const { q } = req.query;
    const { password, confirmPassword } = req.body;

    if (!q) {
      throw new AuthenticationError("Not permitted to access");
    }

    if (password !== confirmPassword) {
      throw new BadRequestError("Password not match");
    }

    const decoded = decode(q);

    if (!decoded) {
      throw new AuthenticationError("Not permitted to access");
    }

    const { email } = decoded;

    const HashPassword = await bcrypt.hash(confirmPassword, 10);

    const user = await updatePassword(email, HashPassword);

    if (!user) {
      throw new BadRequestError("User not found");
    }

    return null;
  }
}

module.exports = new AccessService();
