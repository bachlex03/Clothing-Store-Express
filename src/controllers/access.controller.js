const accessService = require("../services/access.service");
const { OK, CREATED } = require("../core/success.response");

class AccessController {
  async register(req, res) {
    return new CREATED({
      message: "Login successfully",
      statusCode: 200,
      data: await accessService.register(req.body),
    }).redirect(res);
  }

  async login(req, res) {
    console.log("login");
    return new OK({
      message: "Login successfully",
      statusCode: 200,
      data: await accessService.login(req),
    }).send(res);
  }
}

module.exports = new AccessController();
