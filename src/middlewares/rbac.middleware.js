const { AuthenticationError } = require("../core/error.response");
const { rbac } = require("./auth.middleware");
const { roleList } = require("../services/rbac.service");

const grantAccess = (action, resource) => {
  return async (req, res, next) => {
    try {
      const role = req.user?.roles[0]?.role_name ?? "USER";

      const roles = await roleList();

      rbac.setGrants(roles);

      const permission = rbac.can(role)[action](resource);

      if (!permission.granted) {
        throw new AuthenticationError(
          "You don't have enough permission to perform this action"
        );
      }

      next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = { grantAccess };
