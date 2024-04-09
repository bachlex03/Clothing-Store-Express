"use strict";

const { AuthenticationError } = require("../core/error.response");
const passport = require("passport");

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

const authenticationMiddleware = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err || !user || Object.keys(user).length === 0) {
      return next(new AuthenticationError("Unauthorized"));
    } else {
      req.user = user; // Set user in request object
      return next();
    }
  })(req, res, next);
};

module.exports = {
  authorizationMiddleware,
  authenticationMiddleware,
};
