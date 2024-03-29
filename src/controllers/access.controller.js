const accessService = require("../services/access.service");
const { OK } = require("../core/success.response");

class AccessController {
  async register(req, res) {
    return res.json({
      message: "Register",
      data: accessService.signUp(req),
    });
  }

  async login(req, res) {
    return new OK({
      message: "Login successfully",
      statusCode: 200,
      data: await accessService.signIn(req),
    }).send(res);
  }
}

module.exports = new AccessController();
