const rbacService = require("../services/rbac.service");
const { OK, CREATED } = require("../core/success.response");

class rbacController {
  async newRole(req, res) {
    new CREATED({
      message: "Create role",
      statusCode: 200,
      data: await rbacService.createRole(req.body),
    }).send(res);
  }

  async newResource(req, res) {
    new CREATED({
      message: "Create resource",
      statusCode: 200,
      data: await rbacService.createResource(req.body),
    }).send(res);
  }

  async listResources(req, res) {
    new OK({
      message: "Get list resources",
      statusCode: 200,
      data: await rbacService.resourceList(req),
    }).send(res);
  }

  async listRoles(req, res) {
    new OK({
      message: "Get list roles",
      statusCode: 200,
      data: await rbacService.roleList(req),
    }).send(res);
  }
}

module.exports = new rbacController();
