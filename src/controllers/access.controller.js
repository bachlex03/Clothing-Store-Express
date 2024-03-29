class AccessController {
  async register(req, res) {}

  async login(req, res) {
    return res.json({
      message: "Login",
    });
  }
}

module.exports = new AccessController();
