const paymentService = require("../services/paymentService");
const { OK, CREATED } = require("../core/success.response");

class paymentController {
  async payInvoice(req, res) {
    new CREATED({
      message: "Processing payment...",
      statusCode: 200,
      data: await paymentService.payInvoice(req),
    }).send(res);
  }

  async viewDetails(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await paymentService.viewDetails(req.params),
    }).send(res);
  }

  async updateAddress(req, res) {
    new OK({
      message: "OK",
      statusCode: 200,
      data: await paymentService.updateAddress(req),
    }).send(res);
  }
}

module.exports = new paymentController();
