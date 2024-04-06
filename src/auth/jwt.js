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

  Jwt.verify(accessToken, secretKey, (error, decode) => {
    if (error) {
      console.log("Verify failure");
    }

    if (decode) {
      console.log({ decode });
    }
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

module.exports = {
  generateTokenPair,
  generateMailToken,
};
