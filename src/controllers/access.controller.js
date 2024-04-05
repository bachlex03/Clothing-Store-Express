const accessService = require("../services/access.service");
const { OK } = require("../core/success.response");

class AccessController {
  async register(req, res) {
    return res.json({
      message: "Register",
      data: accessService.register(req.body),
    });
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
