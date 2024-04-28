"use strict";

const Jwt = require("jsonwebtoken");

const {
  jwt: { secretKey, accessTokenExpiration, refreshTokenExpiration },
  mailer: { tokenExpiration },
} = require("../config/config.env");

const generateTokenPair = (payload) => {
  const accessToken = Jwt.sign(payload, secretKey, {
    expiresIn: accessTokenExpiration,
  });

  const refreshToken = Jwt.sign(payload, secretKey, {
    expiresIn: refreshTokenExpiration,
  });

  return {
    accessToken,
    refreshToken,
  };
};

const generateMailToken = (payload) => {
  const mailToken = Jwt.sign(payload, secretKey, {
    expiresIn: tokenExpiration,
  });

  return mailToken;
};

const decode = (token) => {
  try {
    const decoded = Jwt.verify(token, secretKey);

    return decoded;
  } catch (err) {
    console.log("Verify token failed");

    return null;
  }
};

module.exports = {
  generateTokenPair,
  generateMailToken,
  decode,
};
