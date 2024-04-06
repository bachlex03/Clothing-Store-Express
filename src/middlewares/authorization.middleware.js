"use strict";

const { AuthenticationError } = require("../core/error.response");

const authorizationMiddleware = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError("Auth error");
    }

    const userRoles = req.user.roles;

    let valid = false;

    userRoles.forEach((role) => {
      if (roles.includes(role)) valid = true;
    });

    if (!valid) {
      throw new AuthenticationError();
    }

    return next();
  };
};

module.exports = authorizationMiddleware;
