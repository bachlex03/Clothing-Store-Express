const accessService = require("../services/access.service");

class AccessController {
  async register(req, res) {
    return res.json({
      message: "Register",
      data: accessService.signUp(req),
    });
  }

  async login(req, res) {
    return res.json({
      message: "Login",
      data: accessService.signIn(req),
    });
  }
}

module.exports = new AccessController();
