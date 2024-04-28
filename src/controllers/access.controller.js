const accessService = require("../services/access.service");
const { OK, CREATED } = require("../core/success.response");

class AccessController {
  async register(req, res) {
    return new CREATED({
      message: "Login successfully",
      statusCode: 200,
      data: await accessService.register(req.body),
    }).send(res);
  }

  async login(req, res) {
    return new OK({
      message: "Login successfully",
      statusCode: 200,
      data: await accessService.login(req.body, res),
    }).send(res);
  }

  async verify(req, res) {
    return new OK({
      message: "OK",
      statusCode: 200,
      data: await accessService.verify(req.query),
    }).send(res);
  }

  async sendMailToken(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await accessService.sendMailToken(req.query),
    }).send(res);
  }

  async verifyEmail(req, res) {
    return new OK({
      message: "Verify successfully",
      statusCode: 200,
      data: await accessService.verifyEmail(req.body),
    }).send(res);
  }

  async recover(req, res) {
    return new OK({
      message: "OK",
      statusCode: 200,
      data: await accessService.recover(req.body),
    }).send(res);
  }

  async resetPassword(req, res) {
    return new OK({
      message: "Reset password successfully",
      statusCode: 200,
      data: await accessService.resetPassword(req),
    }).send(res);
  }
}

module.exports = new AccessController();
