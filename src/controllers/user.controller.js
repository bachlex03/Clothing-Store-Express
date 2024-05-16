const userService = require("../services/user.service");
const { OK, CREATED } = require("../core/success.response");

class paymentController {
  async getCheckoutInfo(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await userService.getCheckoutInfo({ email: req.user.email }),
    }).send(res);
  }

  async updateCheckoutInfo(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await userService.updateCheckoutInfo(req),
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
      data: await userService.updateAddresses(req),
    }).send(res);
  }

  async updateProfile(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await userService.updateProfile(req),
    }).send(res);
  }

  async getInvoices(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await userService.getInvoices(req),
    }).send(res);
  }

  async updatePassword(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await userService.updatePassword(req),
    }).send(res);
  }

  async changeCurrentPassword(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await userService.changeCurrentPassword(req),
    }).send(res);
  }
}

module.exports = new paymentController();
