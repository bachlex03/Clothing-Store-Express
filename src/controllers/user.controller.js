const userService = require("../services/user.service");
const { OK, CREATED } = require("../core/success.response");

class paymentController {
  async getCheckoutInfo(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await userService.getCheckoutInfo(req),
    }).send(res);
  }

  async getProfile(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await userService.getProfile(req),
    }).send(res);
  }

  async getAddress(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await userService.getAddress(req),
    }).send(res);
  }

  async updateAddresses(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await userService.updateAddresses(req.body),
    }).send(res);
  }

  async updateProfile(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await userService.updateProfile(req.body),
    }).send(res);
  }
}

module.exports = new paymentController();
